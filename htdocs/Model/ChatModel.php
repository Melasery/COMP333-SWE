<?php
require_once PROJECT_ROOT_PATH . "/inc/config.php"; // 

class ChatModel
{
    public function getChatResponse($message)
    {
        $url = 'https://api.openai.com/v1/chat/completions';

        $headers = [
            'Authorization: Bearer ' . OPENAI_API_KEY,
            'Content-Type: application/json'
        ];

        $data = [
            'model' => 'gpt-4o-mini', 
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You suggest songs based on mood or vibe.'
                ],
                [
                    'role' => 'user',
                    'content' => $message
                ]
            ],
            'temperature' => 0.8,
            'max_tokens' => 150 
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);

        if (isset($result['choices'][0]['message']['content'])) {
            return $result['choices'][0]['message']['content'];
        } else {
            error_log("OpenAI API error: " . $response);
            return "Sorry, I couldn’t come up with a recommendation.";
        }
    }
}