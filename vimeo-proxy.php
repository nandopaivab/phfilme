<?php
/**
 * PHFILME - Vimeo Showcase Proxy
 * Fetches video IDs from a Vimeo Showcase page server-side to avoid CORS issues.
 * Returns a JSON array of Vimeo video IDs found in the showcase.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=3600'); // Cache for 1 hour

$showcaseUrl = 'https://vimeo.com/showcase/12345001';

// Fetch the showcase page
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $showcaseUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; PHFILME/1.0)');
$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$html) {
    echo json_encode(['success' => false, 'error' => 'Failed to fetch Vimeo showcase', 'videos' => []]);
    exit;
}

// Extract video IDs using multiple regex patterns
$videoIds = [];

// Pattern 1: /videos/ID
preg_match_all('/\/videos\/(\d{7,})/', $html, $matches);
$videoIds = array_merge($videoIds, $matches[1]);

// Pattern 2: clip_ID 
preg_match_all('/clip_(\d{7,})/', $html, $matches);
$videoIds = array_merge($videoIds, $matches[1]);

// Pattern 3: data-clip-id="ID"
preg_match_all('/data-clip-id="(\d{7,})"/', $html, $matches);
$videoIds = array_merge($videoIds, $matches[1]);

// Pattern 4: vimeo.com/ID (but not showcase IDs)
preg_match_all('/vimeo\.com\/(\d{7,})/', $html, $matches);
$videoIds = array_merge($videoIds, $matches[1]);

// Remove duplicates and the showcase ID itself
$videoIds = array_unique($videoIds);
$videoIds = array_values(array_filter($videoIds, function($id) {
    return $id !== '12345001';
}));

echo json_encode([
    'success' => true, 
    'count' => count($videoIds),
    'videos' => $videoIds
]);
