<?php
/**
 * PHFILME - Vimeo Showcase Proxy
 * Fetches video IDs from the Vimeo Showcase EMBED page (server-side) to avoid CORS issues.
 * The embed page is static HTML and reliably contains video IDs unlike the main page.
 * Returns a JSON array of Vimeo video IDs found in the showcase.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=3600'); // Cache for 1 hour

$showcaseId = '12345001';
$embedUrl = "https://vimeo.com/showcase/{$showcaseId}/embed";

// Fetch the showcase EMBED page (static HTML, contains video IDs reliably)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $embedUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; PHFILME/1.0)');
$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$html) {
    echo json_encode(['success' => false, 'error' => 'Failed to fetch Vimeo showcase embed', 'videos' => []]);
    exit;
}

// Extract video IDs - the embed page uses /video/ID format
$videoIds = [];

// Pattern 1: /video/ID (primary pattern in embed pages)
preg_match_all('/\/video\/(\d{7,})/', $html, $matches);
$videoIds = array_merge($videoIds, $matches[1]);

// Pattern 2: clip_id or data-clip-id
preg_match_all('/clip[_-]id["\s:=]+["\']?(\d{7,})/', $html, $matches);
$videoIds = array_merge($videoIds, $matches[1]);

// Pattern 3: "id":NUMBER in JSON config blocks
preg_match_all('/"id"\s*:\s*(\d{7,})/', $html, $matches);
$videoIds = array_merge($videoIds, $matches[1]);

// Remove duplicates and filter out the showcase ID itself and obviously non-video IDs
$videoIds = array_unique($videoIds);
$videoIds = array_values(array_filter($videoIds, function($id) use ($showcaseId) {
    // Exclude the showcase ID and any ID that's too long (likely timestamps/hashes)
    return $id !== $showcaseId && strlen($id) <= 12;
}));

// Verify each ID is a real video by checking oEmbed (optional but ensures quality)
$verifiedIds = [];
foreach ($videoIds as $id) {
    $oembedUrl = "https://vimeo.com/api/oembed.json?url=https://vimeo.com/{$id}";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $oembedUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_NOBODY, false);
    $response = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($code === 200) {
        $data = json_decode($response, true);
        if (isset($data['title'])) {
            $verifiedIds[] = $id;
        }
    }
}

echo json_encode([
    'success' => true,
    'count' => count($verifiedIds),
    'videos' => $verifiedIds
]);
