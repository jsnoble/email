'use strict';


var fs = require('fs');
var json = fs.readFileSync('./mail.json');

var nodemailer = require('nodemailer');
var Promise = require('bluebird');
var path = require('path');
var EmailTemplate = require('email-templates').EmailTemplate;


var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'your user name',
        pass: 'your password'
    }
});

var message = {
    from: 'your password',
        to: 'your email',
        subject: 'lets see if this works'
};


function formatMessage (message, filepath, json){
    var filePath = path.resolve(__dirname, filepath);
    var emailHtml = new EmailTemplate(filePath);
    var jsonData = JSON.parse(json);

    message.attachments = {
        filename:'Raw JSON',
        content: json
    };

   return Promise.resolve(emailHtml.render(jsonData)).then(function(data){
        message.html = data.html;
       message.text = data.text;
        return message;
    });
}

Promise.resolve(formatMessage(message, './templates', json))
    .then(function(msg){
        transporter.sendMail(msg);
    });

