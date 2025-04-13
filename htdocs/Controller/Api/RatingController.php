<?php
class RatingController extends BaseController
{
    /**
     * "/rating/create" Endpoint - Add new rating
     */
    public function createAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $requestData = $this->getRequestData();
    
        // Log the request to check if it's hitting and what it receives
        error_log("HIT: /rating/create");
        error_log("Incoming POST data: " . json_encode($requestData));
    
        if (strtoupper($requestMethod) == 'POST') {
            try {
                $ratingModel = new RatingModel();
    
                // Validate input
                if (empty($requestData['username'])) {
                    throw new Exception("Username is required");
                }
                if (empty($requestData['song'])) {
                    throw new Exception("Song title is required");
                }
                if (empty($requestData['artist'])) {
                    throw new Exception("Artist name is required");
                }
                if (!isset($requestData['rating']) || !is_numeric($requestData['rating'])) {
                    throw new Exception("Rating must be a number");
                }
                if ($requestData['rating'] < 0 || $requestData['rating'] > 9) {
                    throw new Exception("Rating must be between 0-9");
                }
    
                // Try to create rating and catch DB-related errors
                try {
                    $ratingId = $ratingModel->createRating(
                        $requestData['username'],
                        $requestData['song'],
                        $requestData['artist'],
                        $requestData['rating']
                    );
                } catch (Exception $e) {
                    error_log("createRating error: " . $e->getMessage());
                    throw new Exception("Failed to insert rating: " . $e->getMessage());
                }
    
                $responseData = json_encode([
                    'message' => 'Rating created successfully',
                    'rating_id' => $ratingId
                ]);
            } catch (Exception $e) {
                $strErrorDesc = $e->getMessage();
                $strErrorHeader = 'HTTP/1.1 400 Bad Request';
            }
        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }
    
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
     * "/rating/list" Endpoint - Get all ratings
     */
    public function listAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();

        if (strtoupper($requestMethod) == 'GET') {
            try {
                $ratingModel = new RatingModel();
                $intLimit = 100; // Default limit
                
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                }
                
                $arrRatings = $ratingModel->getRatings($intLimit);
                $responseData = json_encode($arrRatings);
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

    /**
     * "/rating/update" Endpoint - Update a rating
     */
    public function updateAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $requestData = $this->getRequestData();
        $arrQueryStringParams = $this->getQueryStringParams();

        if (strtoupper($requestMethod) == 'PUT') {
            try {
                $ratingModel = new RatingModel();
                
                // Validate input
                if (empty($arrQueryStringParams['id'])) {
                    throw new Exception("Rating ID is required");
                }
                if (empty($requestData['username'])) {
                    throw new Exception("Username is required");
                }
                if (empty($requestData['song'])) {
                    throw new Exception("Song title is required");
                }
                if (empty($requestData['artist'])) {
                    throw new Exception("Artist name is required");
                }
                if (!isset($requestData['rating']) || !is_numeric($requestData['rating'])) {
                    throw new Exception("Rating must be a number");
                }
                if ($requestData['rating'] < 0 || $requestData['rating'] > 9) {
                    throw new Exception("Rating must be between 0-9");
                }

                // Update rating
                $affectedRows = $ratingModel->updateRating(
                    $arrQueryStringParams['id'],
                    $requestData['username'],
                    $requestData['song'],
                    $requestData['artist'],
                    $requestData['rating']
                );

                if ($affectedRows === 0) {
                    throw new Exception("Rating not found or unauthorized");
                }

                $responseData = json_encode([
                    'message' => 'Rating updated successfully',
                    'affected_rows' => $affectedRows
                ]);
            } catch (Exception $e) {
                $strErrorDesc = $e->getMessage();
                $strErrorHeader = 'HTTP/1.1 400 Bad Request';
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
     * "/rating/delete" Endpoint - Delete a rating
     */
    public function deleteAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();
        $requestData = $this->getRequestData();

        if (strtoupper($requestMethod) == 'DELETE') {
            try {
                $ratingModel = new RatingModel();
                
                if (empty($arrQueryStringParams['id'])) {
                    throw new Exception("Rating ID is required");
                }
                if (empty($requestData['username'])) {
                    throw new Exception("Username is required");
                }

                $affectedRows = $ratingModel->deleteRating(
                    $arrQueryStringParams['id'],
                    $requestData['username']
                );

                if ($affectedRows === 0) {
                    throw new Exception("Rating not found or unauthorized");
                }

                $responseData = json_encode([
                    'message' => 'Rating deleted successfully',
                    'affected_rows' => $affectedRows
                ]);
            } catch (Exception $e) {
                $strErrorDesc = $e->getMessage();
                $strErrorHeader = 'HTTP/1.1 400 Bad Request';
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
     * "/rating/get" Endpoint - Get single rating
     */
    public function getAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();

        if (strtoupper($requestMethod) == 'GET') {
            try {
                $ratingModel = new RatingModel();
                
                if (empty($arrQueryStringParams['id'])) {
                    throw new Exception("Rating ID is required");
                }
                
                $rating = $ratingModel->getRatingById($arrQueryStringParams['id']);
                
                if (empty($rating)) {
                    throw new Exception("Rating not found");
                }
                
                $responseData = json_encode($rating[0]);
            } catch (Exception $e) {
                $strErrorDesc = $e->getMessage();
                $strErrorHeader = 'HTTP/1.1 404 Not Found';
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