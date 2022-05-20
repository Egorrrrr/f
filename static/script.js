dark = false
var userSelected = ""
var postSelected = ""
var fl_selected = ""
function theme(load) {

    if (!load) {
        if (localStorage.getItem("theme") != "true") {
            localStorage.setItem("theme", "true")
        }
        else {
            console.log("dsd")
            localStorage.setItem("theme", "false")
        }
    }
    dark = !dark
    var elems = document.body.getElementsByTagName("*");
    document.getElementById("bd").style.background = dark ? "black" : "white"
    document.getElementById("theme").innerHTML = dark ? "Светлая тема" : "Темная тема"

    for (element in elems) {
        if (elems[element] != undefined) {
            if (elems[element].style != undefined) {
                elems[element].style.color = dark ? "white" : "black"
                elems[element].style.background = dark ? "black" : "white"
            }
        }

    }


}

function sub(e) {
    e.preventDefault();
    var data = new FormData(document.getElementById("frm"));
    if (data.get("password") != data.get("confirm")) {
        alert("Пароли не совпадают")
        return;
    }

    const req = new XMLHttpRequest()
    req.open('POST', 'http://127.0.0.1:5000/create_user')
    req.send(data)
    req.onreadystatechange = () => {
        console.log(req.responseText)
        if (req.readyState === 4 && req.status === 200) {
            if (req.responseText != "taken") {
                document.getElementById("html").innerHTML = req.responseText
            }
            else {
                alert("Аккаунт с таким e-mail уже зарегистрирован")
            }
        }
    }

}

function out() {
    console.log("sadasd")
    const req = new XMLHttpRequest()
    req.open('POST', 'http://127.0.0.1:5000/logout')
    req.send()
    window.location.href = "/login"
}
function log(e) {
    e.preventDefault();
    var data = new FormData(document.getElementById("frm2"));

    const req = new XMLHttpRequest()
    req.open('POST', 'http://127.0.0.1:5000/sign_in')
    req.send(data)
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            if (req.responseText != "false") {
                //document.getElementById("html").innerHTML = req.responseText
                window.location.href = "/main"
            }
            else {
                alert("Неверный логин или пароль")
            }
        }
    }

}

function get_lastnames() {

    const req = new XMLHttpRequest()
    req.open('GET', 'get_lastnames.php')
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            console.log(req.responseText)
            document.getElementById("main").innerHTML = req.responseText
        }
    }
}

function get_stat() {

    const req = new XMLHttpRequest()
    req.open('GET', 'get_stat.php')
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            console.log(req.responseText)
            document.getElementById("main").innerHTML = req.responseText
        }
    }
}

function search_one() {
    var word = document.getElementById("inp").value
    const req = new XMLHttpRequest()
    req.open('GET', 'search_one.php?usersearch=' + word)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            console.log(req.responseText)
            document.getElementById("main").innerHTML = req.responseText
        }
    }
}

function search_two() {
    var word = document.getElementById("inp").value
    const req = new XMLHttpRequest()
    req.open('GET', 'search_more.php?usersearch=' + word)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            console.log(req.responseText)
            document.getElementById("main").innerHTML = req.responseText
        }
    }
}

function auth() {

    const req = new XMLHttpRequest()
    req.open('POST', 'auth.php')
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            if (req.responseText.split("~")[0] === "Success") {
                alert("Привет, " + req.responseText.split('~')[1])
                window.location.href = "/site.html"
                return true
            } else {
                return false
            }
        }
    }
}

function loadFollowers(opt){
    userSelected = opt
    const req = new XMLHttpRequest()
    req.open('GET', 'get_followers?mail=' + opt)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            let son = JSON.parse(req.responseText)
            console.log(req.responseText)
            let posts = document.getElementById("fol")
            posts.innerHTML = ""
            for (let x in son) {
                posts.innerHTML += `<option onclick=pc(this)  value=${son[x]}> ${son[x]}</option>`
            }
        }
    }
}

function loadPosts(opt) {
    userSelected = opt
    navigator.clipboard.writeText(opt)
    loadFollowers(opt)
    const req = new XMLHttpRequest()
    req.open('GET', 'loadPosts?mail=' + opt)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            let son = JSON.parse(req.responseText)
            let posts = document.getElementById("posts")
            posts.innerHTML = ""
            for (let x in son) {
                posts.innerHTML += `<option onclick=fc(this)  value=${son[x].id}> ${son[x].body}</option>`
            }
        }
    }
}

function addP() {
    let user = userSelected;
    let post = prompt("Введите пост", "");
    const req = new XMLHttpRequest()
    req.open('POST', 'addpost?mail=' + user + "&post=" + post)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            loadPosts(userSelected)   
        }
    }

}


function editP() {
    let post = prompt("Введите отредактированный пост", "");
    const req = new XMLHttpRequest()
    req.open('POST', 'editpost?id=' + postSelected + "&post=" + post)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            loadPosts(userSelected)   
            
        }
    }

}


function delP() {
    const req = new XMLHttpRequest()
    req.open('POST', 'delpost?id=' + postSelected)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            loadPosts(userSelected)   
            
        }
    }

}


function addF() {
    let user = userSelected;
    let post = prompt("Введите email пользователя, на которого вы хотите подписаться", "");
    const req = new XMLHttpRequest()
    req.open('POST', 'follow?mail=' + user + "&user=" + post)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            loadPosts(userSelected)   
        }
    }

}


function addF() {
    let user = userSelected;
    let post = prompt("Введите email пользователя, на которого вы хотите подписаться", "");
    const req = new XMLHttpRequest()
    req.open('POST', 'follow?mail=' + user + "&user=" + post)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            loadPosts(userSelected)   
        }
    }

}

function addF() {
    let user = userSelected;
    let post = prompt("Введите email пользователя, на которого вы хотите подписаться", "");
    const req = new XMLHttpRequest()
    req.open('POST', 'follow?mail=' + user + "&user=" + post)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            loadPosts(userSelected)   
        }
    }

}


function delF() {
    let user = userSelected;
    const req = new XMLHttpRequest()
    req.open('POST', 'unfollow?mail=' + user + "&user=" + fl_selected)
    req.send()
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            loadPosts(userSelected)   
        }
    }

}


document.addEventListener("DOMContentLoaded", function (event) {
    if (localStorage.getItem("theme") == null) {
        localStorage.setItem("theme", "true")
    }
    else if (localStorage.getItem("theme") != "true") {
        theme(true);
    }
    if (window.location.pathname == "/" || window.location.pathname == "/index.html") {
    }
});


var onloadCallback = function () {

};

function pc(p){
    console.log("dsd")
    postSelected = p.value
}

function pc(p){
    console.log("dsd")
    fl_selected = p.value
}