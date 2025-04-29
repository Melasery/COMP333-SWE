<?php
require_once PROJECT_ROOT_PATH . "/Model/Database.php";

class RatingModel extends Database
{
    public function getRatings($limit)
    {
        return $this->select(
            "SELECT * FROM ratings ORDER BY id ASC LIMIT ?", 
            [['type' => 'i', 'value' => $limit]]
        );
    }

    public function getRatingById($id)
    {
        return $this->select(
            "SELECT * FROM ratings WHERE id = ? LIMIT 1", 
            [['type' => 'i', 'value' => $id]]
        );
    }

    public function getRatingByUser($user, $limit)
    {
        return $this->select(
            "SELECT * FROM ratings WHERE username = ? LIMIT ?",
            [['type' => 's', 'value' => $user], ['type' => 'i', 'value' => $limit]]
        );
    }

    public function getRatingNotByUser($user, $limit)
    {
        return $this->select(
            "SELECT * FROM ratings WHERE username != ? LIMIT ?",
            [['type' => 's', 'value' => $user], ['type' => 'i', 'value'=>$limit]]
        );
    }

    public function createRating($username, $song, $artist, $rating)
    {
        $this->executeStatement(
            "INSERT INTO ratings (username, song, artist, rating) VALUES (?, ?, ?, ?)",
            [
                ['type' => 's', 'value' => $username],
                ['type' => 's', 'value' => $song],
                ['type' => 's', 'value' => $artist],
                ['type' => 'i', 'value' => $rating]
            ]
        );
        return $this->connection->insert_id;
    }

    public function updateRating($id, $username, $song, $artist, $rating)
    {
        $this->executeStatement(
            "UPDATE ratings SET song = ?, artist = ?, rating = ? WHERE id = ? AND username = ?",
            [
                ['type' => 's', 'value' => $song],
                ['type' => 's', 'value' => $artist],
                ['type' => 'i', 'value' => $rating],
                ['type' => 'i', 'value' => $id],
                ['type' => 's', 'value' => $username]
            ]
        );
        return $this->connection->affected_rows;
    }

    public function deleteRating($id, $username)
    {
        $this->executeStatement(
            "DELETE FROM ratings WHERE id = ? AND username = ?",
            [
                ['type' => 'i', 'value' => $id],
                ['type' => 's', 'value' => $username]
            ]
        );
        return $this->connection->affected_rows;
    }
}
