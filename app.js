const api = "https://ttt-practice.azurewebsites.net/";
const headers = new Headers();
headers.append("Content-type", "application/json");

const blocks = document.querySelectorAll('.block');
const player = document.querySelector('#player');

const mark = `<div class="mark"></div>`
const zero = `<div class="zero"></div>`


let id = 0;


let name = '';


document.querySelector('.btn').addEventListener('click', () => {


    if (!player.value.match(/[a-z]/i)) {
        alert('enter your name in english and press START GAME, please');
    } else {
        name = player.value;
        canPlay();
    }
})






blocks.forEach(element => {

    element.addEventListener('click', function startGame(e) {

        if (!name) {
            alert('enter your name in english and press START GAME, please');
        } else {
            name = player.value;
            makeMove(element.dataset.number)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    if (data.ok) {
                        console.log(e.target.childNodes);
                        if (!e.target.childNodes.length) {
                            e.target.insertAdjacentHTML('afterbegin', mark);
                        }
                        if (!data.data.win) {
                            return data.data.move;
                        }
                        else {

                            alert('win');
                        }
                    }

                })
                .then(() => {
                    waitMove()
                        .then(response => {
                            return response.json();
                        })
                        .then(data => {
                            const dataMove = document.querySelector(`[data-number='${data.data.move}']`)
                            if (!data.data.win) {
                                if (!dataMove.childNodes.length) {//защита от дурака, если много раз клацать, на кнопку, то уже не появится много элементов
                                    const div = document.createElement('div');
                                    div.classList.add('zero');
                                    dataMove.appendChild(div);

                                }
                            } else {              
                                    alert('you win');
                            }

                        })
                        .catch(error => {
                            console.log(error);
                        })
                })
        }
    })

})



function canPlay() {
    return fetch(`${api}start?name=${name}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(data => {
            if (!id) {//что бы при клике не назначался новый id
                id = data.data.id;
            }
            //возврат разрешение на шаг
            console.log(id);
            return data.data.canMove;
        })
};

function makeMove(move) {
    return fetch(`${api}makeMove`, {
        method: 'POST',
        body: JSON.stringify({ move, id, name }),
        headers
    })
}

function waitMove() {
    return fetch(`${api}waitMove`, {
        method: "POST",
        body: JSON.stringify({ name, id }),
        headers
    })
}
