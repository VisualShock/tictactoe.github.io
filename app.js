const api = "https://ttt-practice.azurewebsites.net/";
const headers = new Headers();
headers.append("Content-type", "application/json");

const blocks = document.querySelectorAll('.block');
const player = document.querySelector('#player');
const spinner = document.querySelector('.spinner');

const mark = `<div class="mark"></div>`
const zero = `<div class="zero"></div>`


let id = 0;


let name = '';


document.querySelector('.btn').addEventListener('click', function initGame() {


    if (!player.value.match(/[a-z]/i)) {
        player.classList.add('player-wrong');
        player.classList.add('shaking');
    } else {

        name = player.value;
        if (player.classList.contains('player-wrong')) {
            player.classList.toggle('player-wrong');
        }
        player.classList.add('player-success');
        document.querySelector('.btn').removeEventListener('click', initGame);
        player.disabled = true;
        canPlay();
        blocks.forEach(element => {

            element.addEventListener('click', function startGame(e) {


                name = player.value;
                makeMove(element.dataset.number)
                    .then(response => {
                        console.log(response.status)
                        if (response.status != /40*/ || response.status != /50*/) {
                            return response.json();
                        } else {
                            throw new Error(`you have an error number ${response.status}`)
                        }
                    })
                    .then(data => {
                        if (data.ok) {

                            if (!e.target.childNodes.length) {
                                e.target.insertAdjacentHTML('afterbegin', mark);

                            }
                            if (!data.data.win) {

                                return data.data.move;
                            }
                            else {//////////КОСТЫЛЬ!!!
                                spinner.style.zIndex = '-111111';//нужна помощь в том, как прервать выполнение, что бы потом не добавлялся спиннер
                                spinner.style.backgroundColor = 'white';

                                ////КОСТЫЛЬ!!!
                                player.classList.add('shaking');
                                player.value = 'win';

                            }
                        }

                    })
                    .then(() => {
                        spinner.style.display = 'block';
                        waitMove()
                            .then((response, reject) => {

                                return response.json();
                            })
                            .then(data => {
                                const dataMove = document.querySelector(`[data-number='${data.data.move}']`)


                                if (!dataMove.childNodes.length) {//защита от дурака, если много раз клацать, на кнопку, то уже не появится много элементов
                                    spinner.style.display = 'none';
                                    const div = document.createElement('div');
                                    div.classList.add('zero');
                                    dataMove.appendChild(div);

                                }
                                if (data.data.win === 0) {
                                    spinner.style.display = 'none';
                                    player.value = 'next time, bro';
                                    if (!player.classList.contains('player-wrong')) {
                                        player.classList.toggle('player-wrong');

                                    }
                                    player.classList.add('shaking');
                                }

                            })
                            .catch(reject => {
                                console.log(reject);
                            })
                    })
                    .catch(error => {
                        console.log(error.name + ': ' + error.message);
                    })

            })

        })
    }
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
