var express = require('express');
var router = express.Router();
const axios = require("axios");
const profile = require("../../middlewares/profile")
const {decryptRequest, encryptResponse} = require("../../middlewares/crypt")
const checkCookie = require("../../middlewares/checkCookie")

router.get('/', checkCookie, function (req, res, next) {
    const cookie = req.cookies.Token;

    profile(cookie).then(pending => {

        axios({
            method: "post",
            url: api_url + "/api/beneficiary/loan",
            headers: {"authorization": "1 " + cookie}
        }).then((data) => {
            let result = decryptRequest(data.data).data;
            var html_data =  "<tr>이미 대출하였습니다.</tr>"

            return res.render("Banking/loan", { html: html_data, pending: pending, select: "loan" });
        }).catch(function (err) {
            var html_data = `
            <table class="table table-bordered" id="dataTable" width="100" cellspacing="0">
                <tr>
                    <td>상품특징</td>
                    <td>
                        <li>보안 직종에 종사하는 직장인들을 위한 맞춤 신용대출 상품 </li>
                    </td>
                </tr>
                <tr>
                    <td>대출신청자격</td>
                    <td>
                        <li>보안 직무(모의해킹 등)를 수행하는 보안 관련 전체 고객</li>                             
                    </td>
                <tr>
                    <td>대출금액</td>
                    <td>
                        <li>최대 1억원 이내</li>
                        <li>최종 대출 한도는 고객님의 멤버십에 따라 차등 적용됩니다.<br>
                            - PREMINUM : 1억 원<br>
                            - FAMILY   : 5천만 원<br>
                            - FRIEND   : 3천만 원
                        </li>
                    </td>
                </tr>
            </table>
            <input type="text" class="form-control form-control-user" id="exampleLastName" name="loan_mount" placeholder="대출">
            `;

            return res.render("Banking/loan", { html: html_data, pending: pending, select: "loan" });
        });
    })
})

module.exports = router;