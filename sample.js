'use strict';

var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var logger, config, statsd;


module.exports = function(context) {
    logger = context.logger;
    config = context.sysconfig;
    statsd = context.statsd.default;
    var api = {
        send: send
    };
    return api;
};

function send(payload, params, done) {
    logger.info("sending to email endpoint");
    if (! params) {
        logger.error("Email transport - called with no configuration.")
        return done(false);
    }
    if (! payload) {
        logger.error("Email transport - called with no payload to send.")
        return done(false);
    }
    if (! params.address) {
        logger.error("Email transport - called with no valid notification address in configuration.")
        return done(false);
    }
    var transport = nodemailer.createTransport(smtpTransport({
        host: config.email.exchanger,
        port: 25
    }));
    var body = JSON.stringify(payload, null, 4);
    var message = config.notification.email.header + "\n" + body + "\n" + config.notification.email.footer;
    var mailOptions = {
        from: config.notification.email.from,
        to: params.address,
        subject: config.notification.email.subject,
        text: message
    };
    transport.sendMail(mailOptions, function(error) {
        if (error) {
            logger.error("Error sending email notification: " + error);
            statsd.increment('notification.' + config._nodeName + '.email.sent.failure');
            statsd.increment('notification.email.sent.failure');
            return done(false);
        }
        statsd.increment('notification.' + config._nodeName + '.email.sent.success');
        statsd.increment('notification.email.sent.success');
        return done(true);
    });
}
