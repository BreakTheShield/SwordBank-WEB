var express = require('express');
var router = express.Router();
const axios = require("axios");
const profile = require("../../middlewares/profile")
const {decryptRequest, encryptResponse} = require("../../middlewares/crypt")
const checkCookie = require("../../middlewares/checkCookie")
var {seoultime} = require('../../middlewares/seoultime');

router.get("/", checkCookie, async (req, res) => {
    const cookie = req.cookies.Token;
   
    profile(cookie).then((data) => {
        axios({
            method: "post",
            url: api_url + "/api/beneficiary/check",
            headers: {"authorization": "1 " + cookie},
        }).then((data2) => {
            var d = decryptRequest((data2.data));
            var results = d.data.accountdata;
            var html_data = `<input type="text" class="form-control form-control-user" autocomplete="off" id="drop" name="to_account" placeholder="대상 계좌번호" list="dropdown"> <datalist id="dropdown">`

            results.forEach(function (a) {
                html_data += `<option value= ${a}></option>`;
            })
            html_data += `</datalist>`
            res.render("Banking/trade_send", {pending: data, html: html_data, select: "send"});
        });
    });
});

router.post("/post", checkCookie, function (req, res, next) {
    const cookie = req.cookies.Token;
    let json_data = {};
    let result = {};

    json_data['to_account'] = parseInt(req.body.to_account);   //데이터가 숫자로 들어가야 동작함
    json_data['amount'] = parseInt(req.body.amount);
    json_data['sendtime'] = seoultime;

    const en_data = encryptResponse(JSON.stringify(json_data));// 객체를 문자열로 반환 후 암호화
    axios({
        method: "post",
        url: api_url + "/api/balance/transfer",
        headers: {"authorization": "1 " + cookie},
        data: en_data
    }).then((data) => {
        result = decryptRequest(data.data);
        statusCode = result.data.status;
        message = result.data.message;

        if(statusCode != 200) {
            res.send(`<script>
            alert("${message}");
            location.href=\"/bank/send\";
            </script>`);
        } else {
            res.send(`<script>
            alert("${message}");
            location.href=\"/bank/list\";
            </script>`);
        }
    });
});

module.exports = router;