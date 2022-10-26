import './product.html'
import './product.css'
import {ObjectId} from 'bson'

function send(data) {
    return fetch('api/product/create', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

function success(body) {
    // return fetch(`api/product/${body._id}`, {method: 'GET'})
    // .then(res => {
    //     return res.json()
    // }).then(body => {
    //     console.log("got the written product:", body)
    // })
}

function failure() {
    return Promise.resolve()
}

function main() {
    const data = {
        name: "Samsung Galaxy A11",
        itemInitial: new ObjectId().toString(),
        isInSale: true
    }

    console.log("data to send", data)
    send(data).then(res => {
        console.log('response:', res)

        return res.json()
    }).then((body, res) => {
        console.log('parsed response body', body)

        return (res.ok) ? success(body) : failure(body)
    })
}

document.addEventListener('DOMContentLoaded', main)