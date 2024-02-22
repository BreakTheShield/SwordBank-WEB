var express = require('express');
var router = express.Router();
var axios = require("axios");
var {encryptResponse, decryptRequest} = require("../../middlewares/crypt");
const profile = require('../../middlewares/profile');
const checkCookie = require("../../middlewares/checkCookie")

var html_data_description = "<h3 align='center'> Mydata 서비스는 타은행의 계좌 잔고확인/송금 까지 한번에 해결할 수 있도록 하는 서비스입니다 !</h3>"


router.get('/', checkCookie, function (req, res) {      // 요청하기 버튼 띄워주는 get 요청
    const cookie = req.cookies.Token;
    console.log(cookie);
    profile(cookie).then(profileData => {
        console.log("mydata에서의 profileData : ",profileData);

        return res.render("Banking/mydata_auth", {html_data: "<br/>", pending: profileData, select: "mydata"});
    });
});

router.post('/', checkCookie, function (req, res) {         //해당 요청하기 버튼을 눌렀을 때 post를 보내주는 코드.
    const cookie = req.cookies.Token;
    
    profile(cookie).then(profileData => {
        console.log("Mydata_auth.js에서 axios get 요청 전  :@@@@@@@@@@@@@@@ ");
        axios({
            method: "get",
            url: api_url + "/api/Mydata/mydata_sms",
            headers: {"authorization": "1 " + cookie}
        }).then((data) => {

            console.log("mydatat got data.data@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ : ",data.data);
            let result = decryptRequest(data.data);
            console.log("result@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ : ",result); //여기서 
            if(result.status.code==200){ //인증번호가 제대로 보내졌으므로 인증번호를 입력하는 창으로 보냄.
                let result = `<script>
                // 팝업 생성 함수
                function createPrompt() {
                  var userInput = prompt("인증번호를 입력해주세요.", "");
                  if (userInput === null || userInput === "") {
                    alert("입력이 취소되었거나 입력이 없습니다.");
                  } else {
                    var authnum = userInput;
      // 인증번호를 처리하는 API 호출
      fetch('/bank/mydata_auth/authnum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ authnum: authnum })
      })
                  }
                }
              
                // 팝업 생성 함수 호출
                createPrompt();
              </script>`
                return res.render("Banking/mydata_auth", {html_data: result, pending: profileData, select: "mydata"});
            }
            else{
                let result = "오류입니다."
                
                return res.render("Banking/mydata_auth", {html_data: result, pending: profileData, select: "mydata"})
            }
        }).catch(function (error) {

            var html_data = [
                 { username: error, balance: error, account_number: error, bank_code: error }
            ];
            console.log("mydata error!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            return res.render("Banking/mydata_auth", {html_data: html_data, pending: profileData, select: "mydata"});
        });
    });
});


router.post('/authnum', checkCookie, function (req, res) {      //인증번호를 A API로 보내주는 부분.
    const cookie = req.cookies.Token;
    let authnum = req.body.authnum;
    console.log("AUTH_NUM@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ : ",authnum);
    profile(cookie).then(profileData => {
        axios({
            method: "post",
            url: api_url + "/api/Mydata/mydata_sms",
            headers: {"authorization": "1 " + cookie},
            data: {
                authnum: authnum
            }
        }).then((data)=>{

            return res.render("Banking/mydata_auth", {html_data: "<br/>", pending: profileData, select: "mydata"});
        }).then((err)=>{


        })

        return res.render("Banking/mydata_auth", {html_data: "<br/>", pending: profileData, select: "mydata"});
    });
});
module.exports = router;