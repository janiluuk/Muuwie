<div id="buyModal">
    <div class="inner">
        <div class="movie group">
                        <div class="moviepic">
                                <img src="http://www.vifi.ee/uploads/movie_pics//t/p/w500/cache_thumbnail_125_178_center_/rLVUINSQvArwvVPnyB1Xu4dQRRv.jpg" alt="">
            </div>
                        <div class="moviedescription">
                <h1>360</h1>
                <table>
                                        <tbody><tr>
                        <th>Subtiitrid</th>
                        <td>
                             <b>Eesti</b>
                        </td>
                    </tr>
   <tr>
   <th>Hind</th>
                        <td><b>2.20 / 48h</b></td>
                    </tr>
                </tbody></table>
            </div>
   <div class="bankpayment" style="display:none">
            <form id="modalPayForm" action="/est/filmid.m/360/moviePage/payment" method="POST">

<p> Emailile saadetakse pilet, millega saate filmi 48 tunni jooksul korduvvaadata.</p> <p> <span style="color:#f00;"><strong>Palume mitte unustada peale makse sooritamist vajutada nuppu "Tagasi kaupmehe juurde".<br> </strong></span></p>

                <div class="group">
                    <input type="text" id="email" style="float:left;" class="input email" name="email" placeholder="Sinu e-posti aadress">
                    <div class="error-container" id="buy-error"></div>
                <input type="hidden" id="modalPayForm_provider" name="provider" value="0">
   <input type="hidden" id="modalPayForm_sum" name="sum" value="2.20">
 
</div>
</form>
</div>


    </div>
        </div>
 
        <div class="header-bg">
            <h2>Vali makseviis</h2>
        </div>
            <ul class="payment-list group" id="payment-methods">
                <li>
                    <a href="#" data-method="2">
                        <img src="http://www.vifi.ee/project_css_js/css/img/payment_swedbank.png" alt="">
                        <p>SWEDBANK</p>
                    </a>
                </li>
                <li>
                    <a href="#" data-method="1">
                        <img src="http://www.vifi.ee/project_css_js/css/img/payment_seb.png" alt="">
                        <p>SEB</p>
                    </a>
                </li>
                <li>
                    <a href="#" data-method="3">
                        <img src="http://www.vifi.ee/project_css_js/css/img/payment_danske.png" alt="">
                        <p>DANSKE</p>
                    </a>
                </li>
                <li>
                    <a href="#" data-method="4">
                        <img src="http://www.vifi.ee/project_css_js/css/img/payment_nordea.png" alt="">
                        <p>NORDEA</p>
                    </a>
                </li>
   <li>
                                        <a href="#"  data-method="5">
                                                <img src="http://www.vifi.ee/project_css_js/css/img/payment_credit.png" alt="" />
                                                <p>KREDIITKAART</p>
                                        </a>
                                </li> 



            </ul>
        <div class="payment-form">
        <p class="pay-button group">
            <a href="#" id="buy-button"></a>
            <img class="loader" style="float:right;margin-right:10px;position:relative;top:12px;display:none" src="http://www.vifi.ee/project_css_js/css/img/ajax-loader.gif" alt="">
        </p>
    </div>
<div class="extra header-bg">
                <h2>Kingituskood</h2>
</div>

           <div class="auth-by-code">

                <div class="group">
<form id="code" accept-charset="UTF-8" action="#" method="post">
   <input type="submit" value="Ok" class="btn go" tabindex="2">
   <div class="inputwrapper">
   <input type="text" name="email" value="" placeholder="Sisesta kood" class="email code" tabindex="1">
   </div>
   </form>

                    <div class="error-container" id="code-error"></div>
                </div>
            </div>
</div>
