
<!DOCTYPE html>
<?php
    session_start();
    include("connection.php");
    if(isset($_POST['btn'])){
        $song = $_POST['song'];
        $artist = $_POST['artist'];
        $rating = $_POST['rating'];
        $user = $_SESSION['username'];
        $sql = " INSERT INTO ratings(username, song, artist, rating) VALUES ( '$user', '$song', '$artist', '$rating')";
        $query = mysqli_query($conn, $sql);
        echo "submitted";
    }
?>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
        <title>Create New Entry</title>
    </head>
<body>
    <div id="form">
        <h1>Enter data here:</h1>
        <form name="form" Onsubmit="return isvalid()" method="POST">
            
            <label>Song: </label>
            <input type="text" id="song" name="song">
        </br></br>
            <label>Artist: </label>
            <input type="text" id="artist" name="artist">
        </br></br>
            <label>Rating: </label>
            <input type="number" step="1" onchange="this.value = Math.max(0, Math.min(9, parseInt(this.value)));" name ="rating">
        </br></br>
            <input type="submit" id="btn" value="submit" name="btn">

    </div>
    <a href="welcome.php">Go Back</a>
    <script>
        function isvalid(){
            var song = document.form.song.value;
            var artist = document.form.artist.value;
            var rating = document.form.rating.value;
            if(song.length=="") {
                alert("Song name is empty.");
                return false
            }
            if(artist.length=="") {
                alert("Artist name is empty.")
                return false
            }
        }
    </script>
</body>
</html>
