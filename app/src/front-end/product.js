// import './product.html'
// import './product.css'

function id() {
    return Math.random()
}

function main() {
    console.log('main')
    const idInput = document.querySelector('.input-text#item')
    const idBtn = document.querySelector('.button-input')

    idBtn.addEventListener('click', (ev) => {
        ev.preventDefault()
        console.log('item id button clicked');
        idInput.value = id().toString()
    })
}

document.addEventListener('DOMContentLoaded', main)