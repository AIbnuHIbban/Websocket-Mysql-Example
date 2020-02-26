var express  = require('express')
var socket = require('socket.io')
var mysql = require('mysql')
var app = express();

var server = app.listen(3000)

// Static File
app.use(express.static('public'))

var io = socket(server)

// Definisi DB
var db = mysql.createConnection({
    host: 'localhost',
    user : 'root',
    database: 'socket_mysql'
})

// Log Error Connection to DB
db.connect(function (err) {
    if(err) console.log(err)
})

var students = []
var isInitStudents = false
var socketCount = 0

io.sockets.on('connection', function (socket) {
    socketCount++

    io.sockets.emit('user online', socketCount)

    socket.on('disconnect', function () {
        socketCount--
        io.sockets.emit('user online', socketCount)
    })

    socket.on('new student', function (data) {
        students.push(data)
        io.sockets.emit('new student', data)

        db.query('INSERT INTO students (name, gender) VALUES (?, ?)', [data.name, data.gender])
    })

    if(!isInitStudents){
        db.query('SELECT * FROM students')
            .on('result', function (data) {
                students.push(data)
            })
            .on('end', function () {
                socket.emit('initial students', students)
            })
        isInitStudents = true
    } else{
        socket.emit('initial students', students)
    }
})