<?php
/**
 * PHFILME - Script de Upload de Arquivos Autohospedado
 * Envia fotos da equipe e capas do portfólio para o próprio servidor de hospedagem.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Define a pasta de destino dos uploads
$uploadFolder = 'uploads';
$targetDir = __DIR__ . '/' . $uploadFolder . '/';

// Cria a pasta se não existir
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

// Verifica se o arquivo foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];
        $fileSize = $_FILES['file']['size'];
        $fileType = $_FILES['file']['type'];
        
        // Sanitiza o nome do arquivo para evitar problemas de URL
        $fileNameClean = time() . '_' . preg_replace("/[^a-zA-Z0-9.-]/", "_", $fileName);
        
        // Verifica se a extensão é permitida (apenas imagens)
        $allowedExtensions = array('jpg', 'jpeg', 'png', 'gif', 'webp');
        $fileExtension = strtolower(pathinfo($fileNameClean, PATHINFO_EXTENSION));
        
        if (in_array($fileExtension, $allowedExtensions)) {
            $destPath = $targetDir . $fileNameClean;
            
            if (move_uploaded_file($fileTmpPath, $destPath)) {
                // Monta a URL pública absoluta
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
                $host = $_SERVER['HTTP_HOST'];
                $uri = dirname($_SERVER['REQUEST_URI']);
                $publicUrl = $protocol . $host . rtrim($uri, '/') . '/' . $uploadFolder . '/' . $fileNameClean;
                
                echo json_encode([
                    "success" => true,
                    "url" => $publicUrl
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "error" => "Não foi possível mover o arquivo para a pasta de destino."
                ]);
            }
        } else {
            echo json_encode([
                "success" => false,
                "error" => "Extensão de arquivo não permitida. Envie apenas JPG, PNG, GIF ou WEBP."
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Nenhum arquivo enviado ou erro no envio."
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "error" => "Método não permitido."
    ]);
}
?>
