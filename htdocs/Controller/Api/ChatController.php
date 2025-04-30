<?php
require_once PROJECT_ROOT_PATH . "/Model/ChatModel.php";

class ChatController extends BaseController
{
    public function askAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $requestData = $this->getRequestData();

        if (strtoupper($requestMethod) == 'POST') {
            try {
                if (empty($requestData['message'])) {
                    throw new Exception("Message is required");
                }

                $chatModel = new ChatModel();
                $reply = $chatModel->getChatResponse($requestData['message']);
                $responseData = json_encode(["reply" => $reply]);
            } catch (Exception $e) {
                $strErrorDesc = $e->getMessage();
                $strErrorHeader = 'HTTP/1.1 400 Bad Request';
            }
        } else {
            $strErrorDesc = 'Only POST method is supported';
            $strErrorHeader = 'HTTP/1.1 405 Method Not Allowed';
        }

        if (!$strErrorDesc) {
            $this->sendOutput($responseData, ['Content-Type: application/json']);
        } else {
            $this->sendOutput(json_encode(['error' => $strErrorDesc]), ['Content-Type: application/json', $strErrorHeader]);
        }
    }
}
