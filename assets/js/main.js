let congelados = [], pasabocas = [];
const getData = async (endpoint, precar) => {
    const url = `https://script.google.com/macros/s/AKfycbzwBAMvyryiWPtCHF0dmX90oU-DMvmQ0ZR_gfymE3oaSkAztQbH_TEWfPnkaJ6esL3X/exec?name=${endpoint}`;
    if (!precar.length) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const jsonResponse = await response.json();
                document.querySelector('#loading').setAttribute('class', 'display');
                let result = '';
                switch (endpoint) {
                    case 'congelados':
                        congelados = [...jsonResponse];
                        break;
                    case 'pasabocas':
                        pasabocas = [...jsonResponse];
                        break;
                }

                for (let i of jsonResponse) {
                    result += `<div class='cont-prod'>
                    <div style="background-image: url('${i.image}');background-size:cover;width:134px;    background-repeat: no-repeat;"></div>
                        <div class='detail'>
                            <h3>${i.plato}</h3>
                            <p>${i.descripcion}</p>
                            <p class='price' data-price='${i.valor}'>${formatterPeso.format(i.valor)}</p>
                            <a href data-id='${i.id}' class="btn-add-cart">Agregar</a></a>
                        </div>
                      
                    </div>`;
                    // console.log(i.plato);
                }
                document.querySelector('.container-items').innerHTML = result;

            }
        } catch (error) {
            console.log(error)
        }
    } else {
        document.querySelector('#loading').setAttribute('class', 'display');
        document.querySelector('.container-items').innerHTML = '';
        let result2 = '';
        for (let i of precar) {
            result2 += `<div class='cont-prod'>
            <div style="background-image: url('${i.image}');background-size:cover;width:134px;    background-repeat: no-repeat;"></div>
                <div class='detail'>
                    <h3>${i.plato}</h3>
                    <p>${i.descripcion}</p>
                    <p class='price' data-price='${i.valor}'>${formatterPeso.format(i.valor)}</p>
                    <a href data-id='${i.id}' class="btn-add-cart">Agregar</a></a>
                </div>
              
            </div>`;
        }
        document.querySelector('.container-items').innerHTML = result2;
    }
}

//variables globales

let allContainerCart = document.querySelector('.container-items');
let buyThings = [];
let totalCard = 0;
let countProduct = 0;
let containerBuyCart = document.querySelector('.card-items');
let priceTotal = document.querySelector('.price-total')
let amountProduct = document.querySelector('#contador-productos');
const slcretiro = document.querySelector("#opcretiro");
const txtNombre = document.querySelector("[name=txt-nombre]");
const txtDir = document.querySelector("[name=txt-dir]");
const obser = document.querySelector('#observaciones');
const mpago = document.querySelector('#mediopago');
const iconsMenu = document.querySelector('.iconos_menu');
const icoMenu = iconsMenu.getElementsByClassName('icomenu');


for (let i = 0; i < icoMenu.length; i++) {
    icoMenu[i].addEventListener("click", function () {
        let current = document.getElementsByClassName("active");
        document.querySelector('#loading').removeAttribute('class', 'display');
        document.querySelector('.container-items').innerHTML = '';
        let cname = this.getAttribute('data-name');
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";

        switch (cname) {
            case 'congelados':
                getData(cname, congelados);
                break;
            case 'pasabocas':
                getData(cname, pasabocas);
                break;
        }

    });
}

function loadEventListeners() {
    allContainerCart.addEventListener('click', addProduct);
    containerBuyCart.addEventListener('click', deleteProduct);
    verEstado();

}

function addProduct(e) {
    let date = new Date();
    e.preventDefault();
    if (date.getHours() < 11 || date.getHours() > 21) {
        Swal.fire({
            icon: 'info',
            title: 'Oops...',
            text: 'Nuestro horario de atención es de de 11:00 am - 10:00 pm!'
        })
    }
    else {
        if (e.target.classList.contains('btn-add-cart')) {
            const selectProduct = e.target.parentElement;
            readContent(selectProduct);
            Swal.fire({
                icon: 'success',
                title: 'Agregado al carrito',
                showConfirmButton: false,
                timer: 1500
            })
        }
    }

}

function readContent(product) {
    const infoProduct = {
        title: product.querySelector('h3').textContent,
        price: product.querySelector('.price').getAttribute('data-price'),
        id: product.querySelector('a').getAttribute('data-id'),
        amount: 1
    }
    //console.log(infoProduct);

    totalCard = parseFloat(totalCard) + parseFloat(infoProduct.price);
    totalCard = totalCard.toFixed(2);

    const exist = buyThings.some(product => product.id === infoProduct.id);
    if (exist) {
        const pro = buyThings.map(product => {
            if (product.id === infoProduct.id) {
                product.amount++;
                return product;
            } else {
                return product
            }
        });
        buyThings = [...pro];
    } else {
        buyThings = [...buyThings, infoProduct]
        countProduct++;
    }
    // console.log(buyThings);
    loadHtml();
}
function deleteProduct(e) {
    if (e.target.classList.contains('delete-product')) {
        const deleteId = e.target.getAttribute('data-id');

        buyThings.forEach(value => {
            if (value.id == deleteId) {
                let priceReduce = parseFloat(value.price) * parseFloat(value.amount);
                totalCard = totalCard - priceReduce;
                totalCard = totalCard.toFixed(2);
            }
        });
        buyThings = buyThings.filter(product => product.id !== deleteId);

        countProduct--;
    }
    //FIX: El contador se quedaba con "1" aunque ubiera 0 productos
    if (buyThings.length === 0) {
        priceTotal.innerHTML = 0;
        amountProduct.innerHTML = 0;
    }
    loadHtml();
}
const formatterPeso = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
})
function loadHtml() {
    clearHtml();
    buyThings.forEach(product => {
        const { title, price, amount, id } = product;
        const row = document.createElement('div');
        row.classList.add('item-cart');
        row.innerHTML = `
            <div class="item-content">
                <h5>${title}</h5>
                <h5 class="cart-price">${formatterPeso.format(price)}</h5>
                <h6>Cantidad: ${amount}</h6>
            </div>
            <span class="delete-product" data-id="${id}">X</span>
        `;

        containerBuyCart.appendChild(row);

        priceTotal.innerHTML = formatterPeso.format(totalCard);

        amountProduct.innerHTML = countProduct;
    });
}
function clearHtml() {
    containerBuyCart.innerHTML = '';
}

function sendPedido() {
    if (buyThings.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Oops...',
            text: 'Elige al menos un plato del menú!'
        });
        return
    };
    let productosParaWsp = buyThings.map(producto => `*${producto.title}* - Cant: ${producto.amount} - Precio: ${formatterPeso.format(producto.price)}`);
    const productosConFormatoAmigable = productosParaWsp.join('%0A%0A');

    const URLDOM = `https://api.whatsapp.com/send?phone=+573116875533&text=¡Hola! Me gustaría realizar el siguiente pedido:%0A%0A${productosConFormatoAmigable}%0A%0A------------------------------------%0A*Total a pagar:*%20${formatterPeso.format(totalCard)}💰%0A
*Opción de retiro:*%20_${slcretiro.value}_ 🛵
%0A*Nombre:*%20_${txtNombre.value}_ 👤
%0A*Dirección:*%20_${txtDir.value}_ 🏠
%0A*Medio de pago:*%20_${mpago.value}_ 💳
%0A*Observaciones:*%20_${obser.value}_ 🫕`;

    const URLREC = `https://api.whatsapp.com/send?phone=+573116875533&text=¡Hola! Me gustaría realizar el siguiente pedido:%0A%0A${productosConFormatoAmigable}%0A%0A------------------------------------%0A*Total a pagar:*%20${formatterPeso.format(totalCard)}💰%0A
*Opción de retiro:*%20_${slcretiro.value}_🏪
%0A*Nombre:*%20_${txtNombre.value}_👤
%0A*Medio de pago:*%20_${mpago.value}_ 💳
%0A*Observaciones:*%20_${obser.value}_🫕`;

    if (slcretiro.value === "Domicilio") {
        if (txtNombre.value === '' || txtDir.value === '' || mpago.value === '') {
            Swal.fire({
                icon: 'info',
                title: 'Oops...',
                text: 'Faltan datos por ingresar!'
            })
        } else {
            window.open(URLDOM, "_blank");
        }

    } else if (slcretiro.value === "Retiro local") {
        if (txtNombre.value === '' || mpago.value === '') {
            Swal.fire({
                icon: 'info',
                title: 'Oops...',
                text: 'Faltan datos por ingresar!'
            })
        } else {
            window.open(URLREC, "_blank");
        }
    } else {
        Swal.fire({
            icon: 'info',
            title: 'Oops...',
            text: 'Debes seleccionar una opción de retiro!'
        })
    }

}
slcretiro.addEventListener("change", () => {
    if (slcretiro.value === "Domicilio") {
        txtNombre.style.display = 'initial';
        txtDir.style.display = 'initial';
        mpago.style.display = 'initial';
        obser.style.display = 'initial';
    } else if (slcretiro.value === "Retiro local") {
        txtNombre.style.display = 'initial';
        mpago.style.display = 'initial';
        obser.style.display = 'initial';
        txtDir.style.display = 'none';
    } else {
        txtNombre.style.display = 'none';
        txtDir.style.display = 'none';
        obser.style.display = 'none';
        mpago.style.display = 'none';
    }
});
const verEstado = () => {
    const iestado = document.querySelector('.estado');
    let date = new Date();
    if (date.getHours() < 8 || date.getHours() > 20) {
        iestado.innerHTML = `Cerrado <i class='fas fa-chevron-down'></i>`;
        iestado.style.background = '#ff2222';
    }
}
const verHorario = () => {
    Swal.fire({
        title: '<strong>Cobertura y horario</strong>',
        html: '<p><b>Barrios:</b> Alto bosque, Bosque, Nuevo bosque.</p><br>' +
            '<p><b>Horario domicilos:</b> De 11:00 AM a 10:00 PM, todos los días.</p>'
    })
}
loadEventListeners();
getData('congelados', congelados);

