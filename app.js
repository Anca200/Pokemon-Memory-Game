const tilesContainer = document.querySelector(".tiles");
const pokemonCount = 6; // Number of unique Pokémon pairs
const tileCount = pokemonCount * 2; // Each Pokémon appears twice

const colors = {
    fire: 'orange',
    grass: 'lightgreen',
    electric: 'yellow',
    water: '#70ffea',
    ground: 'darkgrey',
    rock: 'grey',
    fairy: 'pink',
    poison: 'greenyellow',
    bug: '#94ecbe',
    dragon: 'orange',
    psychic: '#7c7db6',
    flying: '#fcca46',
    fighting: 'darkgrey',
    normal: 'lightgrey',
    ice: '#00f2f2',
    dark: '#4f7ecf',
    ghost: '#7685a7',
    steel: 'steelblue',
};

// Getting the keys of the colors object to access the color value later
const mainTypes = Object.keys(colors);

// Game state
let revealedCount = 0;
let activeTile = null;
let awaitingEndOfMove = false;

// Fetch a random Pokémon
async function fetchRandomPokemon() {
    const randomId = Math.floor(Math.random() * 200) + 1; // Random ID between 1 and 200
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const data = await response.json();

    // Fetch the first type for color matching
    const type = data.types[0].type.name;
    return {
        name: data.name,
        image: data.sprites.other.dream_world.front_default,
        type: type // Include the type in the returned object
    };
}

// Initialize the game
async function initializeGame() {
    const promises = [];
    for (let i = 0; i < pokemonCount; i++) {
        promises.push(fetchRandomPokemon());
    }

    // Wait for all Pokémon to be fetched
    const pokemonArray = await Promise.all(promises);
    const fullPicklist = [...pokemonArray, ...pokemonArray]; // Duplicate for pairs

    // Shuffle the full picklist
    fullPicklist.sort(() => Math.random() - 0.5);

    // Build up tiles
    fullPicklist.forEach(pokemon => {
        const tile = buildTile(pokemon);
        tilesContainer.appendChild(tile);
    });
}

// Build individual tiles for each Pokémon
const buildTile = (pokemon) => {
    const element = document.createElement("div");
    element.classList.add("tile");
    element.setAttribute("data-pokemon", pokemon.name);
    element.setAttribute("data-revealed", "false");

    const img = document.createElement("img");
    img.src = pokemon.image;

    const name = document.createElement("h3");
    name.textContent = pokemon.name;

    element.appendChild(img);
    element.appendChild(name);

    // Find the corresponding color for the Pokémon type
    const color = colors[pokemon.type];

    // Event listener for tile click
    element.addEventListener("click", () => {
        const revealed = element.getAttribute("data-revealed");

        if (awaitingEndOfMove || revealed === "true" || element === activeTile) {
            return;
        }

        // Reveal Pokémon image and name, and apply border color
        element.classList.add("revealed");
        element.style.border = `2px solid  ${color}`; 
        if (!activeTile) {
            activeTile = element;
            return;
        }

        const pokemonToMatch = activeTile.getAttribute("data-pokemon");

        if (pokemonToMatch === pokemon.name) {
            activeTile.setAttribute("data-revealed", "true");
            element.setAttribute("data-revealed", "true");
            activeTile = null;
            awaitingEndOfMove = false;
            revealedCount += 2;

            if (revealedCount === tileCount) {
                // You win logic here
                alert("You Win! Refresh to play again.") 
            }
            return;
        }

        awaitingEndOfMove = true;
        setTimeout(() => {
            element.classList.remove("revealed");
            element.style.border = '';  // Reset the border color
            activeTile.classList.remove("revealed");
            activeTile.style.border = '';  

            awaitingEndOfMove = false;
            activeTile = null;
        }, 1000);
    });

    return element;
};

// Start the game
initializeGame();