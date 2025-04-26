<?php
class DataController extends BaseController
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
                $dataModel = new DataModel();
    
                // Validate input
                if (empty($requestData['song'])) {
                    $responseData = json_encode([
                        'message' => 'Song is required'
                    ]);                
                }
                else if (empty($requestData['artist'])) {
                    $responseData = json_encode([
                        'message' => 'Artist name is required'
                    ]);                 
                }
                else if (empty($requestData['lyrics'])) {
                    $responseData = json_encode([
                        'message' => 'Lyrics are required'
                    ]);       
                }
                else{
                    $existingData = $dataModel->getDataBySongArtist($requestData['song'], $requestData['artist']);
                    if (!empty($existingData)) {
                        $responseData = json_encode([
                            'message' => 'Data already exists'
                        ]);                
                    }    
                    else {
                        // Try to create data and catch DB-related errors
                        try {
                            $dataId = $dataModel->createData(
                               $requestData['song'],
                                $requestData['artist'],
                                str_replace("\n", " ", $requestData['lyrics'])
                            );
                        } catch (Exception $e) {
                            error_log("createData error: " . $e->getMessage());
                         throw new Exception("Failed to insert data: " . $e->getMessage());
                        }
    
                        $responseData = json_encode([
                           'message' => 'Data created successfully',
                            'data_id' => $dataId
                        ]);
                    }

                }
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

    public function getSongAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $requestData = $this->getRequestData();
        $arrQueryStringParams = $this->getQueryStringParams();

        if(strtoupper($requestMethod) == 'POST') {
            try {
                $dataModel = new DataModel();

                if (empty($requestData['song'])) {
                    throw new Exception("Song is required");
                }
                else if (empty($requestData['artist'])) {
                    throw new Exception("Artist is required");
                }
                else {
                    $arrData = $dataModel->getDataBySongArtist($requestData['song'], $requestData['artist']);
                    if (count($arrData) != 0) {
                        $responseData = json_encode($arrData[0]);
                    }
                    else {
                        throw new Exception("Data not found");
                    }
                }
            } catch (Exception $e) {
                $strErrorDesc = $e->getMessage();
                $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
            }

        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Uprocessable Entity';
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

    public function listAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();

        if (strtoupper($requestMethod) == 'GET') {
            try {
                $dataModel = new DataModel();
                $intLimit = 100; // Default limit
                
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                }
                
                $arrData = $dataModel->getData($intLimit);
                $responseData = json_encode($arrData);
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
