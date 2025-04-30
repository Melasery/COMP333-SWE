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

    public function createSimAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $requestData = $this->getRequestData();
        error_log("HIT: /rating/create");
        error_log("Incoming POST data: " . json_encode($requestData));
    
        if (strtoupper($requestMethod) == 'POST') {
            try {
                $dataModel = new DataModel();
    
                // Validate input
                if (empty($requestData['song1'])) {
                    $responseData = json_encode([
                        'message' => 'First song is required'
                    ]);                
                }
                else if (empty($requestData['artist1'])) {
                    $responseData = json_encode([
                        'message' => 'First artist name is required'
                    ]);                 
                }
                else if (empty($requestData['song2'])) {
                    $responseData = json_encode([
                        'message' => 'Second song is required'
                    ]);       
                }
                else if (empty($requestData['artist2'])) {
                    $responseData = json_encode([
                        'message' => 'Second artist is required'
                    ]);
                }
                else if (empty($requestData['similarity'])) {
                    $responseData = json_encode([
                        'message' => 'Similarity Score is required'
                    ]);
                }
                else{
                    $existingData = $dataModel->getSim($requestData['song1'], $requestData['artist1'], $requestData['song2'], $requestData['artist2']);
                    if (!empty($existingData)) {
                        $responseData = json_encode([
                            'message' => 'Data already exists'
                        ]);                
                    }    
                    else {
                        try {
                            $dataId = $dataModel->createSim(
                               $requestData['song1'],
                                $requestData['artist1'],
                                $requestData['song2'],
                                $requestData['artist2'],
                                $requestData['similarity']
                            );
                        } catch (Exception $e) {
                            error_log("createData error: " . $e->getMessage());
                         throw new Exception("Failed to insert data: " . $e->getMessage());
                        }
    
                        $responseData = json_encode([
                           'message' => 'Similarity Score created successfully',
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
                        $responseData = json_encode(['message' => 'Song found']);
                    }
                    else {
                        $responseData = json_encode(['message' => 'Song not found']);
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

    public function getSimAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $requestData = $this->getRequestData();
        $arrQueryStringParams = $this->getQueryStringParams();

        if(strtoupper($requestMethod) == 'POST') {
            try {
                $dataModel = new DataModel();

                if (empty($requestData['song1'])) {
                    throw new Exception("First Song is required");
                }
                else if (empty($requestData['artist1'])) {
                    throw new Exception("First Artist is required");
                }
                else if (empty($requestData['song2'])) {
                    throw new Exception("Second Song is required");
                }                
                else if (empty($requestData['artist2'])) {
                    throw new Exception("Second Artist is required");
                }                
                else {
                    $arrData = $dataModel->getSim($requestData['song1'], $requestData['artist1'], $requestData['song2'], $requestData['artist2']);
                    if (count($arrData) != 0) {
                        $responseData = json_encode(['message' => 'Song found', 'data' => $arrData[0]['similarity']]);
                    }
                    else {
                        $responseData = json_encode(['message' => 'Song not found']);
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

    public function listExclusionAction()
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
                else{
                        try {
                            $arrData = $dataModel->getDataExcludingSongArtist(
                               $requestData['song'],
                                $requestData['artist']
                            );
                        } catch (Exception $e) {
                            error_log("getExclusion error: " . $e->getMessage());
                         throw new Exception("Failed to get data: " . $e->getMessage());
                        }
    
                        $responseData = json_encode($arrData);

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

    public function newSuggestionAction()
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
                if (empty($requestData['username'])) {
                    $responseData = json_encode([
                        'message' => 'Username is required'
                    ]);                
                }
                else if (empty($requestData['song'])) {
                    $responseData = json_encode([
                        'message' => 'Song title is required'
                    ]);                 
                }
                else if (empty($requestData['artist'])) {
                    $responseData = json_encode([
                        'message' => 'Artist Name is required'
                    ]);
                }
                else if (empty($requestData['points'])) {
                    $responseData = json_encode([
                        'message' => 'Points are required'
                    ]);
                }
                else{
                    $existingSuggestion = $dataModel->getSuggestion($requestData['username'], $requestData['song'], $requestData['artist']);
                    if (!empty($existingSuggestion)) {
                        $newPoints = $existingSuggestion[0]["points"] + $requestData['points'];
                        try {
                            $arrData = $dataModel->updatePoints(
                                $requestData['username'],
                                 $requestData['song'],
                                 $requestData['artist'],
                                 $newPoints
                             );                        
                        } catch (Exception $e) {
                            error_log("update suggestion error: " . $e->getMessage());
                            throw new Exception("Failed to update suggestion: " . $e->getMessage());
                        }
                        $responseData = json_encode(['message' => 'suggestion updated']);
                    }
                    else {
                        try {
                            $arrData = $dataModel->createSuggestion(
                                $requestData['username'],
                                 $requestData['song'],
                                 $requestData['artist'],
                                 $requestData['points']
                             );                        
                        } catch (Exception $e) {
                            error_log("create suggestion error: " . $e->getMessage());
                            throw new Exception("Failed to create suggestion: " . $e->getMessage());
                        }
                        $responseData = json_encode(['message' => 'suggestion created']);
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

    public function getEmotionAction()
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
                if (empty($requestData['user'])) {
                    $responseData = json_encode([
                        'message' => 'Username is required'
                    ]); 
                }
                else if (empty($requestData['song'])) {
                    $responseData = json_encode([
                        'message' => 'Song is required'
                    ]);                
                }
                else if (empty($requestData['artist'])) {
                    $responseData = json_encode([
                        'message' => 'Artist name is required'
                    ]);                 
                }
                else{
                        try {
                            $arrData = $dataModel->getEmotion(
                                $requestData['user'],
                               $requestData['song'],
                                $requestData['artist']
                            );
                        } catch (Exception $e) {
                            error_log("getExclusion error: " . $e->getMessage());
                         throw new Exception("Failed to get data: " . $e->getMessage());
                        }
    
                        $responseData = json_encode($arrData);

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

    public function getEmotionTallyAction()
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
                else{
                        try {
                            $arrData = $dataModel->emotionTally(
                               $requestData['song'],
                                $requestData['artist']
                            );
                        } catch (Exception $e) {
                            error_log("getEmotionTally error: " . $e->getMessage());
                         throw new Exception("Failed to get data: " . $e->getMessage());
                        }
                        $sad = 0;
                        $happy = 0;
                        $excited = 0;
                        $fear = 0;
                        $anger = 0;
                        $nostalgia = 0;
                        $total = 0;
                        for ($i = 0; $i < count($arrData); $i++) {
                            if ($arrData[$i]['sad']) {
                                $sad += 1;
                                $total += 1;
                            }
                            else if ($arrData[$i]['happy']) {
                                $happy += 1;
                                $total += 1;
                            }
                            else if ($arrData[$i]['excited']) {
                                $excited += 1;
                                $total += 1;
                            }
                            else if ($arrData[$i]['fear']) {
                                $fear += 1;
                                $total += 1;
                            }
                            else if ($arrData[$i]['anger']) {
                                $anger += 1;
                                $total += 1;
                            }
                            else if ($arrData[$i]['nostalgia']) {
                                $nostalgia += 1;
                                $total += 1;
                            }
                        }
                        
                        $responseData = json_encode(['sad' => $sad, 'happy' => $happy, 'excited' => $excited, 'fear' => $fear, 'anger' => $anger, 'nostalgia' => $nostalgia, 'total' => $total, 'message' => "Data retrieved"]);

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

    public function addEmotionAction() {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $requestData = $this->getRequestData();
    
        // Log the request to check if it's hitting and what it receives
        error_log("HIT: /rating/create");
        error_log("Incoming POST data: " . json_encode($requestData));
    
        if (strtoupper($requestMethod) == 'POST') {
            try {
                $dataModel = new DataModel();
                    $existingData = $dataModel->getEmotion($requestData['user'], $requestData['song'], $requestData['artist']);
                    if (!empty($existingData)) {
                        try {
                            $arrData = $dataModel->updateEmotion(
                                $requestData['user'],
                               $requestData['song'],
                                $requestData['artist'],
                                $requestData['sad'],
                                $requestData['happy'],
                                $requestData['excited'],
                                $requestData['fear'],
                                $requestData['anger'],
                                $requestData['nostalgia']
                             );                        
                        } catch (Exception $e) {
                            error_log("update suggestion error: " . $e->getMessage());
                            throw new Exception("Failed to update suggestion: " . $e->getMessage());
                        }
                        $responseData = json_encode(['message' => 'suggestion updated']);
                    }    
                    else {
                        // Try to create data and catch DB-related errors
                        try {
                            $dataId = $dataModel->createEmotion(
                                $requestData['user'],
                               $requestData['song'],
                                $requestData['artist'],
                                $requestData['sad'],
                                $requestData['happy'],
                                $requestData['excited'],
                                $requestData['fear'],
                                $requestData['anger'],
                                $requestData['nostalgia']
                            );
                        } catch (Exception $e) {
                            error_log("createEmotion error: " . $e->getMessage());
                         throw new Exception("Failed to insert emotion: " . $e->getMessage());
                        }
    
                        $responseData = json_encode([
                           'message' => 'Emotion created successfully',
                            'data_id' => $dataId
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
}
