const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkOWRhZGE0NDAwMmQxMjM1MGRhMWI3Mjc3ZWIxMTgxOSIsIm5iZiI6MTc1ODI2NTQwNC40NzcsInN1YiI6IjY4Y2QwMDNjZTU5ZTEyMjllMDVlOTFjNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.APHi2RJy6Jky2Cxx9u0c9ywxH8YeyeNpKKu2MhIp-DI'
    }
};

fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=2&sort_by=popularity.desc', options)
    .then(res => res.json())
    .then(res => {
        let main = document.getElementById("row");

        main.innerHTML = '';

        res.results.forEach(movie => {
            main.innerHTML += `
        <div class="card col-4">
    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title} Poster>
  <div class="card-body">
    <h5 class="card-title">${movie.title}</h5>
    <p class="card-text">${movie.overview}</p>
    <p>Release Date: ${movie.release_date}</p>

</div>
</div >
          
            `;
        });

        console.log(res.results);
    })
    .catch(err => console.error(err));


 

// movie list
     
const options1 = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkOWRhZGE0NDAwMmQxMjM1MGRhMWI3Mjc3ZWIxMTgxOSIsIm5iZiI6MTc1ODI2NTQwNC40NzcsInN1YiI6IjY4Y2QwMDNjZTU5ZTEyMjllMDVlOTFjNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.APHi2RJy6Jky2Cxx9u0c9ywxH8YeyeNpKKu2MhIp-DI'
  }
};

fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc', options1)
     .then(res => res.json())
    .then(res => {
        let main = document.getElementById("row");

        main.innerHTML = '';

        res.results.forEach(movie => {
            main.innerHTML += `
        <div class="card col-4">
    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title} Poster>
  <div class="card-body">
    <h5 class="card-title">${movie.title}</h5>
    <p class="card-text">${movie.overview}</p>
    <p>Release Date: ${movie.release_date}</p>

</div>
</div >
          
            `;
        });

        console.log(res.results);
    })
    .catch(err => console.error(err));


 