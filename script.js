const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const searchBtn = document.getElementById("searchBtn");
const recipeContainer = document.getElementById("recipeContainer");
const favoritesContainer = document.getElementById("favoritesContainer");
const clearBtn = document.getElementById("clearFavorites");

const modal = document.getElementById("recipeModal");
const modalBody = document.getElementById("modalBody");
const closeBtn = document.querySelector(".close");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

displayFavorites();

searchBtn.addEventListener("click", searchRecipes);

searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") searchRecipes();
});

clearBtn.addEventListener("click", () => {
    favorites = [];
    localStorage.removeItem("favorites");
    displayFavorites();
});

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
};

async function searchRecipes() {

    recipeContainer.innerHTML = "<p class='loading'>Loading...</p>";

    let url = "";

    if (categorySelect.value) {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categorySelect.value}`;
    } else {
        const q = searchInput.value.trim();
        if (!q) {
            recipeContainer.innerHTML = "<p class='error'>Enter a recipe name or choose a category.</p>";
            return;
        }
        url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.meals) {
        recipeContainer.innerHTML = "<p class='error'>No recipes found.</p>";
        return;
    }

    recipeContainer.innerHTML = "";

    for (let meal of data.meals) {

        if (!meal.strInstructions) {
            const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
            meal = (await r.json()).meals[0];
        }

        recipeContainer.innerHTML += `
        <div class="recipe-card">
            <img src="${meal.strMealThumb}">
            <div class="recipe-content">
                <h3>${meal.strMeal}</h3>
                <p><b>Category:</b> ${meal.strCategory}</p>
                <p><b>Area:</b> ${meal.strArea}</p>

                <div class="buttons">
                    <button class="view-btn" onclick="showRecipe('${meal.idMeal}')">
                        View
                    </button>

                    <button class="fav-btn" onclick="addFavorite('${meal.idMeal}')">
                        ❤️ Favorite
                    </button>
                </div>
            </div>
        </div>`;
    }
}

async function showRecipe(id) {

    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const meal = (await res.json()).meals[0];

    modalBody.innerHTML = `
        <h2>${meal.strMeal}</h2>

        <img src="${meal.strMealThumb}">

        <p><b>Category:</b> ${meal.strCategory}</p>

        <p><b>Cuisine:</b> ${meal.strArea}</p>

        <h3>Instructions</h3>

        <p>${meal.strInstructions}</p>
    `;

    modal.style.display = "block";
}

async function addFavorite(id) {

    if (favorites.some(m => m.idMeal === id)) {
        alert("Already added!");
        return;
    }

    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const meal = (await res.json()).meals[0];

    favorites.push(meal);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    displayFavorites();
}

function displayFavorites() {

    if (!favorites.length) {
        favoritesContainer.innerHTML = "<p class='empty'>No favorite recipes.</p>";
        return;
    }

    favoritesContainer.innerHTML = favorites.map(meal => `
        <div class="favorite-item">
            <img src="${meal.strMealThumb}">
            <div class="favorite-info">
                <h4>${meal.strMeal}</h4>
                <p>${meal.strCategory}</p>
            </div>

            <button class="remove-btn"
            onclick="removeFavorite('${meal.idMeal}')">
                X
            </button>

        </div>
    `).join("");
}

function removeFavorite(id) {

    favorites = favorites.filter(m => m.idMeal !== id);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    displayFavorites();
}