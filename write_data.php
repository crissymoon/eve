<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST;
    }
    
    $filename = $input['filename'] ?? 'py_files/passed_info.txt';
    $content = $input['content'] ?? '';
    $append = $input['append'] ?? true;
    
    $mode = $append ? 'a' : 'w';
    
    if (file_put_contents($filename, $content, $append ? FILE_APPEND : 0)) {
        echo json_encode(['success' => true, 'message' => 'Data written successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to write data']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
