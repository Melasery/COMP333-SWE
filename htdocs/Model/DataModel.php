<?php
require_once PROJECT_ROOT_PATH . "/Model/Database.php";

class DataModel extends Database
{
    public function getDataBySongArtist($song, $artist)
    {
        return $this->select(
            "SELECT * FROM songdata WHERE song = ? and artist = ?",
            [['type' => 's', 'value' => $song], ['type' => 's', 'value' => $artist]]
        );
    }

    public function createData($song, $artist, $lyrics)
    {
        $this->executeStatement(
            "INSERT INTO songdata (song, artist, lyrics) VALUES (?,?,?)",
            [
                ['type' => 's', 'value' => $song],
                ['type' => 's', 'value' => $artist],
                ['type' => 's', 'value' => $lyrics] 
            ]
        );
        return $this->connection->insert_id;
    }

    public function getData($limit)
    {
        return $this->select(
            "SELECT * FROM songdata ORDER BY id ASC LIMIT ?", 
            [['type' => 'i', 'value' => $limit]]
        );
    }
}
