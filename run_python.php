<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $pythonFile = $input['file'] ?? '';
    $data = $input['data'] ?? [];
    
    if (!$pythonFile) {
        echo json_encode(['success' => false, 'message' => 'No Python file specified']);
        exit;
    }
    
    $filePath = 'py_files/' . $pythonFile;
    
    if (!file_exists($filePath)) {
        echo json_encode(['success' => false, 'message' => 'Python file not found']);
        exit;
    }
    
    $dataJson = json_encode($data);
    $tempFile = tempnam(sys_get_temp_dir(), 'python_data_');
    file_put_contents($tempFile, $dataJson);
    
    $command = "cd " . __DIR__ . " && python3 -c \"
import sys
import json
sys.path.append('py_files')
with open('$tempFile', 'r') as f:
    data = json.loads(f.read())
exec(open('$filePath').read())
\"";
    
    $output = shell_exec($command . ' 2>&1');
    unlink($tempFile);
    
    echo json_encode([
        'success' => true, 
        'output' => $output,
        'file' => $pythonFile,
        'data' => $data
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
