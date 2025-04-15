<?php
class UserController extends BaseController
{
    /**
     * "/user/register" Endpoint - Register new user
     */
    public function registerAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $requestData = $this->getRequestData();

        if (strtoupper($requestMethod) == 'POST') {
            try {
                $userModel = new UserModel();
                $existingUser = $userModel->getUserByUsername($requestData['username']);
                // Validate input
                if (empty($requestData['username'])) {
                    $responseData = json_encode([
                        'message' => 'Username is required'
                    ]);
                }
                else if (empty($requestData['password'])) {
                    $responseData = json_encode([
                        'message' => 'Password is required'
                    ]);
                }
                else if ($requestData['password'] !== $requestData['confirm_password']) {
                    $responseData = json_encode([
                        'message' => 'Passwords do not match'
                    ]);                }
                else if (strlen($requestData['password']) < 10) {
                    $responseData = json_encode([
                        'message' => 'Password is less than 10 characters'
                    ]);
                }

                // Check if username exists
                else if (!empty($existingUser)) {
                    $responseData = json_encode([
                        'message' => 'Username is already taken'
                    ]);                }

                // Create user
                else {$userId = $userModel->createUser(
                    $requestData['username'],
                    $requestData['password']
                );

                $responseData = json_encode([
                    'message' => 'User registered successfully',
                    'user_id' => $userId,
                    'username' => $requestData['username']
                ]);
                }
            } catch (Exception $e) {
                $strErrorDesc = $e->getMessage();
                $strErrorHeader = 'HTTP/1.1 400 Bad Request';
            }
        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }

        // Send output
        if (!$strErrorDesc) {
            $this->sendOutput(
                $responseData,
                ['Content-Type: application/json', 'HTTP/1.1 201 Created']
            );
        } else {
            $this->sendOutput(
                json_encode(['error' => $strErrorDesc]), 
                ['Content-Type: application/json', $strErrorHeader]
            );
        }
    }

    /**
     * "/user/login" Endpoint - Authenticate user
     */
    public function loginAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $requestData = $this->getRequestData();

        if (strtoupper($requestMethod) == 'POST') {
            try {
                $userModel = new UserModel();
                
                if (empty($requestData['username']) || empty($requestData['password'])) {
                    throw new Exception("Username and password required");
                }

                $user = $userModel->getUserByUsername($requestData['username']);
                
                if (empty($user)) {
                    throw new Exception("Invalid credentials");
                }

                if (!password_verify($requestData['password'], $user[0]['password'])) {
                    throw new Exception("Invalid credentials");
                }

                $responseData = json_encode([
                    'message' => 'Login successful',
                    'username' => $user[0]['username']
                ]);
            } catch (Exception $e) {
                $strErrorDesc = $e->getMessage();
                $strErrorHeader = 'HTTP/1.1 401 Unauthorized';
            }
        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }

        if (!$strErrorDesc) {
            $this->sendOutput(
                $responseData,
                ['Content-Type: application/json', 'HTTP/1.1 200 OK']
            );
        } else {
            $this->sendOutput(
                json_encode(['error' => $strErrorDesc]), 
                ['Content-Type: application/json', $strErrorHeader]
            );
        }
    }

    /**
     * "/user/list" Endpoint - Get list of users (Admin-only in real apps)
     */
    public function listAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();

        if (strtoupper($requestMethod) == 'GET') {
            try {
                $userModel = new UserModel();
                $intLimit = 100; // Default limit
                
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                }
                
                $arrUsers = $userModel->getUsers($intLimit);
                $responseData = json_encode($arrUsers);
            } catch (Exception $e) {
                $strErrorDesc = $e->getMessage();
                $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
            }
        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }

        if (!$strErrorDesc) {
            $this->sendOutput(
                $responseData,
                ['Content-Type: application/json', 'HTTP/1.1 200 OK']
            );
        } else {
            $this->sendOutput(
                json_encode(['error' => $strErrorDesc]), 
                ['Content-Type: application/json', $strErrorHeader]
            );
        }
    }
}
