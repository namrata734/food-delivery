const fullNameElement = document.getElementById('fullName');
const emailIdElement = document.getElementById('emailId');
const phoneNumberElement = document.getElementById('phoneNumber');
const passwordElement = document.getElementById('password');
const addElement = document.getElementById('add');
const loginEmailElement = document.getElementById('loginEmailId');
const loginPasswordElement = document.getElementById('loginPassword');

const forgetPassEmailIdElement = document.getElementById('forgetPassEmailId');
const newPasswordElement = document.getElementById('newPassword');
const forgetPassPhoneNumberElement = document.getElementById('forgetPassPhoneNumber');


axios.get('http://localhost:3001/getRestaurant').then((result) => {
    console.log(result);
    const chooseRestoEle = document.getElementById('restoSelect');
    if (chooseRestoEle) {
        result.data.result.forEach((eachResto => {
            const optionTag = document.createElement('option');
            optionTag.value = eachResto._id;
            optionTag.text = eachResto.restaurantName;
            chooseRestoEle.appendChild(optionTag);
        }));
    }
    const locationChoicesElement = document.getElementById('locationChoices');
    if (locationChoicesElement) {
        result.data.result.forEach((eachResto => {
            const optionTag = document.createElement('option');
            optionTag.value = eachResto.details.address;
            optionTag.text = eachResto.details.address;
            locationChoicesElement.appendChild(optionTag);
        }));
    }
    const foodChoicesElement = document.getElementById('foodChoices');
    if (foodChoicesElement) {
        let listOfFood = [];
        result.data.result.forEach((eachResto => {
            for (const key in eachResto.foodItems) {
                eachResto.foodItems[`${key}`].forEach((foodItem) => {
                    console.log(foodItem.name);
                    if (!listOfFood.includes(foodItem.name)) {
                        listOfFood.push(foodItem.name);
                    }

                });
            }
        }));
        listOfFood.forEach(foods => {
            const optionTag = document.createElement('option');
            optionTag.value = foods;
            optionTag.text = foods;
            foodChoicesElement.appendChild(optionTag);
        })
    }


}).catch((err) => {
    console.log(err);
})



let email = '';

function initializeEmail() {
    axios.post('http://localhost:3001/read-token', {}).then((response) => {

        if (response && response.data && response.data.decodedUserDetail && response.data.decodedUserDetail.email) {

            const logoutbuttonElement = document.getElementById('logoutbutton');
            if (logoutbuttonElement) {
                const logoutElement = document.createElement('div');
                logoutElement.innerHTML = `<button onclick="logout()">Logout</button><br/><br/>`;
                logoutbuttonElement.appendChild(logoutElement);
            }

            const orderHistoryElement = document.getElementById('goToOrderHistory');
            if (orderHistoryElement) {
                orderHistoryElement.innerHTML = `<button onclick= "goToOrderHistoryPage()">Go To Past Orders</button><br/><br/>`;
            }

            const goBackToCartElement = document.getElementById('goBackToCart');
            if (goBackToCartElement) {
                const goBackButtonElement = document.createElement('div');
                goBackButtonElement.innerHTML = `<button onclick= "goBackToCartPage()">Go Back</button>`;
                goBackToCartElement.appendChild(goBackButtonElement);
            }
        }
    }).catch(err => {
        console.log(err);
    })


}
initializeEmail();

function goToOrderHistoryPage() {
    window.location.href = 'http://localhost:3001/order_history';
}

function goBackToCartPage() {
    window.location.href = 'http://localhost:3001/cart';
}

function logout() {
    axios.get('http://localhost:3001/clear-cookie').then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    })
    window.location.href = 'http://localhost:3001/login_signup';
}

function login() {
    console.log(loginEmailElement.value, loginPasswordElement.value);
    const data = {
        email: loginEmailElement.value,
        password: loginPasswordElement.value
    }
    axios.post('http://localhost:3001/login', data).then((result) => {
        console.log(result);
        email = loginEmailElement.value;
        alert(result.data.message);
        if (result.data.message == 'login successful') {
            axios.post('http://localhost:3001/read-token', {}).then((response) => {
                console.log(response);
                if (response && response.data && response.data.decodedUserDetail) {
                    email = response.data.decodedUserDetail.email;
                }
            }).catch(err => {
                console.log(err);
            })
            window.location.href = 'http://localhost:3001/cart';
        }
        document.getElementById('loginEmailId').value = '';
        document.getElementById('loginPassword').value = '';

    }).catch((err) => {
        console.log(err);
    });
}

function forgetPass() {
    const data = {
        email: forgetPassEmailIdElement.value,
        phoneNumber: forgetPassPhoneNumberElement.value,
        newPassword: newPasswordElement.value
    }
    axios.post('http://localhost:3001/forgotPassword', data).then((result) => {
        console.log(result);
        alert(result.data.message);
        document.getElementById('forgetPassEmailId').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('forgetPassPhoneNumber').value = '';
    }).catch((err) => {
        console.log(err);
    });
}

function signup() {
    console.log(fullNameElement.value, emailIdElement.value, passwordElement.value, phoneNumberElement.value, addElement.value);

    const data = {
        fullName: fullNameElement.value,
        email: emailIdElement.value,
        contact: phoneNumberElement.value,
        password: passwordElement.value,
        add: addElement.value
    };
    axios.post('http://localhost:3001/signup', data).then((result) => {
        console.log(result);
        alert(result.data.message);
        document.getElementById('fullName').value = '';
        document.getElementById('emailId').value = '';
        document.getElementById('phoneNumber').value = '';
        document.getElementById('password').value = '';
        document.getElementById('add').value = '';
    }).catch((err) => {
        console.log(err);
    });
}


function displayRestruantByFood() {
    var food = document.getElementById('foodChoices').value;
    if (food != "default") {
        axios.get(`http://localhost:3001/getRestaurant?food=${food}`).then((response) => {
            console.log(response);
            const restoSelectElement = document.getElementById('restoSelect');

            while (restoSelectElement.options.length > 1) {
                restoSelectElement.remove(1);
            }
            if (restoSelectElement) {
                response.data.data.forEach(eachResto => {
                    const optionTag = document.createElement('option');
                    optionTag.value = eachResto._id;
                    optionTag.text = eachResto.restaurantName;
                    restoSelectElement.appendChild(optionTag);
                });
            }
        }).catch((err) => {
            console.log(err);
        })
    } else {
        alert('select a food first');
    }
}

function displayRestruantByLocation() {
    var location = document.getElementById('locationChoices').value;
    if (location != "default") {
        axios.get(`http://localhost:3001/getRestaurant?location=${location}`).then((response) => {
            console.log(response);
            const restoSelectElement = document.getElementById('restoSelect');

            while (restoSelectElement.options.length > 1) {
                restoSelectElement.remove(1);
            }
            if (restoSelectElement) {
                response.data.data.forEach(eachResto => {
                    const optionTag = document.createElement('option');
                    optionTag.value = eachResto._id;
                    optionTag.text = eachResto.restaurantName;
                    restoSelectElement.appendChild(optionTag);
                });
            }
        }).catch((err) => {
            console.log(err);
        })
    } else {
        alert('select a location first');
    }
}

function displayFood() {
    const resto_id = document.getElementById('restoSelect').value;
    if (resto_id != 0) {
        axios.get(`http://localhost:3001/getRestaurant?id=${resto_id}`).then((response) => {
            console.log(response);
            const foodItemsElement = document.getElementById('food-items');
            const foodItems = response.data.data[0].foodItems;
            foodItemsElement.innerHTML = '';
            for (const key in foodItems) {
                foodItems[`${key}`].forEach(foodItem => {
                    const foodItemEle = document.createElement('div');
                    foodItemEle.innerHTML = `<span>${foodItem.name} - Rs ${foodItem.price}</span>
                <button onclick="addToCart('${foodItem.name}', ${foodItem.price}, ${foodItem.id})" >Add To Cart</button>`;
                    foodItemsElement.appendChild(foodItemEle);
                })
            }

        }).catch((err) => {
            console.log(err);
        })
    } else {
        alert('select any restaurant');
    }
}

let cart = [];

function addToCart(foodName, foodPrice, foodId) {
    // console.log(foodName, foodPrice);
    let updatedIndex = -1;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].foodId == foodId) {
            updatedIndex = i;
        }
    }
    if (updatedIndex != -1) {
        cart[updatedIndex].quantity += 1;
        cart[updatedIndex].totalPrice += foodPrice;
    } else {
        cart.push({ foodName, foodPrice, foodId, quantity: 1, totalPrice: foodPrice });
    }
    refershCart();
}

function removeFromCart(foodId) {
    // cart.filter(eachItem => eachItem.foodId != foodId);
    let removeIndex = -1;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].foodId == foodId) {
            removeIndex = i;
        }
    }

    if (removeIndex != -1) {
        if (cart[removeIndex].quantity == 1) {
            cart.splice(removeIndex, 1);
        } else {
            cart[removeIndex].quantity -= 1;
            cart[removeIndex].totalPrice -= cart[removeIndex].foodPrice;
        }
    }
    refershCart();
}

function refershCart() {
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = '';
    let totalCost = 0;
    cart.forEach(cartItem => {
        const cartItemElement = document.createElement('div');
        cartItemElement.innerHTML = `<span>${cartItem.foodName} - Rs ${cartItem.foodPrice}, ${cartItem.quantity} units </span>
        <button onclick="removeFromCart(${cartItem.foodId})">Remove</button>
        `;
        totalCost += cartItem.totalPrice;
        cartContainer.appendChild(cartItemElement);
    })
    if (cart.length) {
        const totalCostElement = document.createElement('div');
        totalCostElement.innerHTML = `<span>Total Cost - Rs ${totalCost} </span>
        <button onclick="placeOrder()">Order</button>`;
        cartContainer.appendChild(totalCostElement);
    }
}

function placeOrder() {

    axios.post('http://localhost:3001/read-token', {}).then((response) => {
        if (response && response.data && response.data.decodedUserDetail && response.data.decodedUserDetail.email) {
            email = response.data.decodedUserDetail.email;
            let data = {
                email,
                cart,
            }
            axios.post('http://localhost:3001/addOrder', data).then((response) => {
                alert(response.data.message);
                cart = [];
                refershCart();
                window.location.href = 'http://localhost:3001/order_history';
                refreshOrder()
            }).catch((err) => {
                console.log(err);
            });
        }
    }).catch(err => {
        console.log(err);
    })

}

function refreshOrder() {
    const orderContainer = document.getElementById('orderHistoryContainer');
    axios.post('http://localhost:3001/read-token', {}).then((response) => {
        if (response && response.data && response.data.decodedUserDetail && response.data.decodedUserDetail.email) {
            email = response.data.decodedUserDetail.email;
            if (orderContainer) {
                orderContainer.innerHTML = '';

                axios.get(`http://localhost:3001/getOrders?email=${email}`).then((response) => {
                    console.log(response);
                    response.data.message.forEach(orders => {
                        const orderListElement = document.createElement('div');
                        orders.cart.forEach(cartItem => {
                            const cartItemElement = document.createElement('div');
                            cartItemElement.innerHTML = `<span>${cartItem.foodName} - Rs ${cartItem.foodPrice}, ${cartItem.quantity} units -> Rs ${cartItem.totalPrice} </span>`;
                            orderListElement.appendChild(cartItemElement);
                        });
                        const dateAndPriceElement = document.createElement('div');
                        const date = new Date(orders.orderedOn);
                        const istTime = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                        dateAndPriceElement.innerHTML = `<span>Total Cost - Rs ${orders.totalPrice} Order on ${istTime} and Order Status -> ${orders.orderStatus}</span>`
                        orderListElement.appendChild(dateAndPriceElement);
                        orderContainer.appendChild(orderListElement);
                        orderContainer.appendChild(document.createElement('br'));
                    });
                }).catch((err) => {
                    console.log(err);
                });
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

