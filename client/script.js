const form = document.querySelector('.js-form');
const input = document.querySelector('.js-input');
const submit = document.querySelector('.js-submit');

window.addEventListener('DOMContentLoaded', () => {
    setup();
});

function setup() {
    setupEventListener();
}

function postFormData(formData) {
    const config = {
        method: 'POST',
        headers: new Headers(),
        mode: 'cors',
        cache: 'default',
        body: formData,
    };

    // const url = 'https://arcade-feu-deploy.herokuapp.com/upload-project';
    const url = 'http://localhost:9999/upload-project';
    fetch(url, config).then((res) => {
        console.log('Request complete! response:', res);
    });
}

function setupEventListener() {
    form.addEventListener('submit', submitHandler);
}

function submitHandler(e) {
    const formData = new FormData(form);
    postFormData(formData);

    e.preventDefault();
}

setup();