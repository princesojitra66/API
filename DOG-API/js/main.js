let openId = null;

function show() {
    fetch("https://dog.ceo/api/breeds/list/all")
        .then(response => response.json())
        .then(data => {
            const sideBox = document.getElementById("side_box");
            let breedsHTML = '<ul class="list-group">';

            for (let breed in data.message) {
                const subBreeds = data.message[breed];
                const hasSub = subBreeds.length > 0;
                const subId = `sub-${breed}`;

                breedsHTML += `<li class="list-group-item">
                    <div class="d-flex align-items-center justify-content-between breed-header" style="cursor: pointer;" onclick="toggleSubBreeds('${subId}', this)">
                        <span onclick="event.stopPropagation(); photo('${breed}')">${breed}</span>
                        ${hasSub ? '<i class="fas fa-chevron-right text-muted"></i>' : ''}
                    </div>`;

                if (hasSub) {
                    breedsHTML += `
                        <ul class="list-group ms-4 mt-2 d-none" id="${subId}">
                            ${subBreeds.map(sub => `
                                <li class="list-group-item" style="cursor: pointer;" onclick="photo('${breed}/${sub}')">${sub}</li>
                            `).join('')}
                        </ul>`;
                }

                breedsHTML += `</li>`;
            }

            breedsHTML += '</ul>';
            sideBox.innerHTML = breedsHTML;
        })
        .catch(error => console.error('Fetch error:', error));
}

function toggleSubBreeds(id, headerEl) {
    const clickedList = document.getElementById(id);
    const clickedIcon = headerEl.querySelector("i");

    if (openId && openId !== id) {
        const openList = document.getElementById(openId);
        const openHeader = document.querySelector(`[onclick*="${openId}"]`);
        const openIcon = openHeader?.querySelector("i");

        openList?.classList.add("d-none");
        openIcon?.classList.remove("fa-chevron-down");
        openIcon?.classList.add("fa-chevron-right");
    }

    const isHidden = clickedList.classList.contains("d-none");

    if (isHidden) {
        clickedList.classList.remove("d-none");
        clickedIcon?.classList.remove("fa-chevron-right");
        clickedIcon?.classList.add("fa-chevron-down");
        openId = id;
    } else {
        clickedList.classList.add("d-none");
        clickedIcon?.classList.remove("fa-chevron-down");
        clickedIcon?.classList.add("fa-chevron-right");
        openId = null;
    }
}

function photo(breedPath) {
    fetch(`https://dog.ceo/api/breed/${breedPath}/images`)
        .then(response => response.json())
        .then(data => {
            const photoBox = document.getElementById("photo_box");
            if (!data || !data.message) return;

            const images = data.message;
            let photoHTML = images.map(url => `
                <div class="col-4 ">
                <div class ="ratio ratio-4x3">
                <img src="${url}" class="img-fluid rounded shadow-sm" alt="${breedPath}">
                </div>
                </div>
            `).join("");

            photoBox.innerHTML = photoHTML;
        })
        .catch(error => console.error("Error loading images:", error));
}


show();



document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const query = document.getElementById('searchInput').value.trim().toLowerCase();

    if (!query) return alert('Please enter a breed name');

    const photoBox = document.getElementById('photo_box');
    photoBox.innerHTML = '<p>Loading...</p>';

    searchAndShowPhotos(query);
});

function searchAndShowPhotos(query) {

    fetch(`https://dog.ceo/api/breed/${query}/images`)
        .then(res => res.json())
        .then(data => {
            const photoBox = document.getElementById('photo_box');
            if (data.status === "error") {
                photoBox.innerHTML = `<p>Breed "${query}" not found. Try another.</p>`;
                return;
            }

            const images = data.message;
            if (!images || images.length === 0) {
                photoBox.innerHTML = `<p>No images found for "${query}".</p>`;
                return;
            }

            let html = `
                <h3 class="mb-3 text-capitalize">${query.replace('/', ' ')}</h3>
                <div class="row">
                    ${images.map(url => `
              <div class="col-4 p-2">
                <div class ="ratio ratio-4x3">
              <img src="${url}" alt="${query}" class="img-fluid rounded shadow-sm" />
                </div>
                </div>
                    `).join('')}
                </div>
            `;

            photoBox.innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            document.getElementById('photo_box').innerHTML = `<p>Error loading images.</p>`;
        });
}






async function showAllBreedsWithPhotos() {
    const photoBox = document.getElementById("photo_box");
    photoBox.innerHTML = `<p>Loading all breeds...</p>`;

    try {
        const response = await fetch("https://dog.ceo/api/breeds/list/all");
        const data = await response.json();
        const breeds = data.message;

        const photoPromises = [];

        for (let breed in breeds) {

            photoPromises.push(
                fetch(`https://dog.ceo/api/breed/${breed}/images/random`)
                    .then(res => res.json())
                    .then(img => ({ url: img.message, label: breed }))
                    .catch(() => null)
            );


            for (let sub of breeds[breed]) {
                photoPromises.push(
                    fetch(`https://dog.ceo/api/breed/${breed}/${sub}/images/random`)
                        .then(res => res.json())
                        .then(img => ({ url: img.message, label: `${breed} ${sub}` }))
                        .catch(() => null)
                );
            }
        }

        const photoResults = await Promise.all(photoPromises);
        const validPhotos = photoResults.filter(p => p !== null);


        const html = validPhotos.map(dog => `
             <div class="col-4 p-2">
                <div class ="ratio ratio-4x3  text-center text-white">
                <img src="${dog.url}" class="img-fluid rounded shadow-sm mb-2" alt="${dog.label}">
                <p class="text-capitalize fw-semibold">${dog.label}</p>
                </div>
                </div>


           
        `).join("");

        photoBox.innerHTML = `<div class="row">${html}</div>`;

    } catch (error) {
        photoBox.innerHTML = `<p class="text-danger">Failed to load breeds.</p>`;
        console.error(error);
    }
}


document.getElementById("allPhotosBtn").addEventListener("click", function (e) {
    e.preventDefault();
    showAllBreedsWithPhotos();
});




   document.getElementById("gameMenu").addEventListener("click", function (e) {
      e.preventDefault(); // prevent page jump
      document.getElementById("gameSection").style.display = "block";
    });

    // Function to fetch and show a random dog image
    function showDog() {
      fetch("https://dog.ceo/api/breeds/image/random")
        .then(res => res.json())
        .then(data => {
          document.getElementById("dogImage").src = data.message;
        })
        .catch(err => console.error("Error fetching dog image:", err));
    }


   function fetchRandomDogImage() {
            fetch('https://dog.ceo/api/breeds/image/random')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('dogImage').src = data.message;
                })
                .catch(error => console.error('Error fetching dog image:', error));
        }

        // Show the game buttons when "GAME" is clicked
        document.getElementById('gameLink').addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            
            // Show the game buttons section
            document.getElementById('gameButtons').style.display = 'block';
        });

        // Button click events for each button
        document.getElementById('btn1').addEventListener('click', function() {
            fetchRandomDogImage();
        });

        document.getElementById('btn2').addEventListener('click', function() {
            fetchRandomDogImage();
        });

        document.getElementById('btn3').addEventListener('click', function() {
            fetchRandomDogImage();
        });

        // Initial photo load
        fetchRandomDogImage();