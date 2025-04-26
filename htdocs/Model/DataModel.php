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

    public function createSim($song1, $artist1, $song2, $artist2, $similarity)
    {
        $this->executeStatement(
            "INSERT INTO lyricsimilarity (song1, artist1, song2, artist2, similarity) VALUES (?,?,?,?,?)",
            [
                ['type' => 's', 'value' => $song1],
                ['type' => 's', 'value' => $artist1],
                ['type' => 's', 'value' => $song2],
                ['type' => 's', 'value' => $artist2],
                ['type' => 'i', 'value' => $similarity]
            ]
        );
        return $this-> connection->insert_id;
    }

    public function getSim($song1, $artist1, $song2, $artist2)
    {
        return $this->select(
            "SELECT * FROm lyricsimilarity WHERE (song1 = ? AND artist1 = ? AND song2 = ? AND artist2 = ?) OR (song1 = ? AND artist1 = ? AND song2 = ? AND artist2 = ?)",
            [
                ['type' => 's', 'value' => $song1],
                ['type' => 's', 'value' => $artist1],
                ['type' => 's', 'value' => $song2],
                ['type' => 's', 'value' => $artist2],                
                ['type' => 's', 'value' => $song2],
                ['type' => 's', 'value' => $artist2],
                ['type' => 's', 'value' => $song1],
                ['type' => 's', 'value' => $artist1],            
            ]
        );
    }

    public function getDataExcludingSongArtist($song, $artist)
    {
        return $this->select(
            "SELECT * FROM songdata WHERE song != ? OR artist != ?",
            [['type' => 's', 'value' => $song], ['type' => 's', 'value' => $artist]]
        );
    }

    public function getData($limit)
    {
        return $this->select(
            "SELECT * FROM songdata ORDER BY id ASC LIMIT ?", 
            [['type' => 'i', 'value' => $limit]]
        );
    }
}
