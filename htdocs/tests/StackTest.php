<?php

class StackTest extends PHPUnit\Framework\TestCase
{
   protected $client;

   protected function setUp() : void{
      parent::setUp();
      $this->client = new GuzzleHttp\Client(["base_uri" => "http://localhost:8080/index.php"]);
   }

   public function testGet_UserList() {
      $response = $this->client->request('GET', 'index.php/user/list');
      $this->assertEquals(200, $response->getStatusCode());
   }
   public function testPost_CreateUser() {
      $response = $this->client->request('POST', 'index.php/rating/create', [
         'headers' => [
            'Content-Type' => 'application/json'
         ],
         'json' => [
            'username' => 'testUser',
            'song' => 'testSong',
            'artist' => 'testArtist',
            'rating' => 0
         ]
      ]);
      $this->assertEquals(201, $response->getStatusCode());
   }
   public function testPost_LoginUser() {
      $response = $this->client->request('POST', 'index.php/user/login', [
         'headers' => [
            'Content-Type' => 'application/json'
         ],
         'json' => [
            'username' => 'PasswordIs1234567890',
            'password' => '1234567890'
         ]
      ]);
      $this->assertEquals(201,$response->getStatusCode());
   }
   public function testPost_FailedLogIn() {
      $response = $this->client->request('POST', 'index.php/user/login', [
         'headers' => [
            'Content-Type' => 'application/json'
         ],
         'json' => [
            'username' => 'PasswordIs1234567890',
            'password' => 'NOT1234567890'
         ]
      ]);
      $this->assertEquals(201,$response->getStatusCode());
   }

   public function tearDown() : void{
      parent::tearDown();
      $this->client = null;
   }
}
?>
