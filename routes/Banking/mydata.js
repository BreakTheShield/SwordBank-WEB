var express = require('express');
var router = express.Router();
var axios = require("axios");
var {encryptResponse, decryptRequest} = require("../../middlewares/crypt");
const profile = require('../../middlewares/profile');
const checkCookie = require("../../middlewares/checkCookie")

router.get('/', checkCookie, function (req, res) {
    const cookie = req.cookies.Token;
    profile(cookie).then(profileData => {
        console.log("mydata에서의 profileData : ",profileData);

        return res.render("Banking/mydata", {html_data: "<br/>", pending: profileData, select: "mydata"});
    });
});

router.post('/', checkCookie, function (req, res) {
    const cookie = req.cookies.Token;
    profile(cookie).then(profileData => {
        axios({
            method: "post",
            url: api_url + "/api/mydata/req_account",
            headers: {"authorization": "1 " + cookie},
        }).then((data) => {
            var account_list = data.data.data;
            var result="";
            
            if(account_list.length > 0) {
                result = "<tr>\n";
                account_list.forEach(account => {
                    if(account.bank_code == 333){
                        var bank_code = "SWORDBANK";
                    }
                    else{
                        var bank_code = "SHIELDBANK";
                    }
                    if(account.bank_code == 333){
                        var bank_code = "SWORDBANK";
                    }
                    else{
                        var bank_code = "SHIELDBANK";
                    }

                    result += "<td>" + account.account_number + "</td>\n";
                    result += "<td>" + account.balance + "</td>\n";
                    result += "<td>" + bank_code + "</td>\n";
                    result += "<td style='width:89px'> <button ";
                    result += "class='btn btn-user btn-block' type='button' onclick='redirectToTransferPage(\"" + account.account_number + "\", \"" + account.balance + "\", \"" + account.bank_code + "\")' style='background-color:#b937a4 !important; color:white !important;'>"
                    result += "송금</button></td>";
                    result += "</tr>\n";

                });
                
            }
            else {
                result += "<tr>\n"
                result += "<td colspan='3'>계좌가 없습니다.</td>\n"
                result += "</tr>\n"
            }

            return res.render("Banking/mydata", {html_data: result, pending: profileData, select: "mydata"});
        }).catch(function (error) {
            return error;
        });
    });
});

module.exports = router;