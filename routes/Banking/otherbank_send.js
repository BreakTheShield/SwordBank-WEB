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
            var html_data = `
                <input type="text" class="form-control form-control-user" autocomplete="off" id="drop_from" name="from_account" placeholder="보내는 계좌번호" list="dropdown_from" value="from_amount" readonly>
                <datalist id="dropdown_from">`;
            results.forEach(function (a) {
                html_data += `<option value="${a}"></option>`;
            });
            html_data += `</datalist>`;

            html_data += `<input type="text" class="form-control form-control-user" autocomplete="off" id="drop" name="bank_code" placeholder="은행코드" list="dropdown" value="bankcode" readonly> <datalist id="dropdown">`
            results.forEach(function (a) {
                html_data += `<option value= "${a}"></option>`;
            })
            html_data += `</datalist>`

            html_data += `<input type="text" class="form-control form-control-user" autocomplete="off" id="drop" name="to_account" placeholder="대상 계좌번호" list="dropdown"> <datalist id="dropdown">`
            results.forEach(function (a) {
                html_data += `<option value= ${a}></option>`;
            })
            html_data += `</datalist>`

            html_data += `<input type="text" class="form-control form-control-user" autocomplete="off" id="drop" name="amount" placeholder="금액" list="dropdown"> <datalist id="dropdown">`
            results.forEach(function (a) {
                html_data += `<option value= ${a}></option>`;
            })
            html_data += `</datalist>`

            res.render("Banking/otherbank_send", {pending: data, html: html_data, select: "otherbank_send"});
        });
    });
});

router.post("/post", checkCookie, function (req, res, next) {
    const cookie = req.cookies.Token;
    let json_data = {};
    let result = {};

    json_data['from_account'] = parseInt(req.body.from_account);
    json_data['to_account'] = parseInt(req.body.to_account);   //데이터가 숫자로 들어가야 동작함
    json_data['amount'] = parseInt(req.body.amount);
    json_data['bank_code'] = parseInt(req.body.bank_code);
    json_data['sendtime'] = seoultime;

    console.log("000000000000000000000", req.body.bank_code);

    const en_data = encryptResponse(JSON.stringify(json_data));// 객체를 문자열로 반환 후 암호화

    axios({
        method: "post",
        url: api_url + "/api/mydata/b_to_a",
        headers: {"authorization": "1 " + cookie},
        data: en_data
    }).then((data) => {
        result = decryptRequest(data.data);
        statusCode = result.data.status;
        message = result.data.message;

        if(statusCode != 200) {
            res.send(`<script>
            alert("${message}");
            location.href=\"/bank/otherbank_send\";
            </script>`);
        } else {
            res.send(`<script>
            alert("${message}");
            location.href=\"/bank/otherbank_send\";
            </script>`);
        }
    });
    
});

module.exports = router;