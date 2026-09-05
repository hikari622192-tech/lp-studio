/*! 街データ ウィジェット v1  2026-08-27
 *  貼り方:
 *  <script src="<このファイルのURL>" data-muni="兵庫県芦屋市" data-co="御社名"
 *          data-color="#1d5540" data-contact="https://御社/contact/"><\/script>
 *  置いた場所にそのまま出ます。Shadow DOM なので、御社サイトのCSSとぶつかりません。 */
(function(){
  'use strict';
  // 🔴 currentScript は同期実行のときだけ取れる。async/defer を付けられたとき用に src で拾う保険。
  var okaS = document.currentScript;
  if (!okaS) {
    var okaAll = document.querySelectorAll('script[src*="machidata.js"]');
    okaS = okaAll[okaAll.length - 1];
  }
  if (!okaS || okaS.__okaDone) return;
  okaS.__okaDone = 1;

  var okaBase = String(okaS.src).replace(/machidata\.js.*$/, '');
  var okaAttr = function(k, d){ var v = okaS.getAttribute('data-' + k); return (v == null || v === '') ? d : v; };
  var okaCfg = {
    co:      okaAttr('co', ''),
    color:   okaAttr('color', ''),
    muni:    okaAttr('muni', ''),
    contact: okaAttr('contact', ''),
    label:   okaAttr('label', 'この街について聞く')
  };

  var okaHost = document.createElement('div');
  okaHost.setAttribute('data-oka-machidata', '1');
  okaS.parentNode.insertBefore(okaHost, okaS);
  // 🔴 open にしておく。closed にすると相手の制作会社が中を見られず、不具合の切り分けができない。
  var okaRoot = okaHost.attachShadow({ mode: 'open' });
  okaRoot.innerHTML = '<style>' + ":host{\n  --brand:#1d5540; --brand-2:#123626; --accent:#a8863c;\n  --ink:#171a19; --ink-2:#3d4643; --muted:#77807b; --line:#e4e1da; --line-2:#efece5;\n  --bg:#faf9f6; --card:#fff; --tint:#f3f6f3;\n  display:block; color:var(--ink); line-height:1.8; font-feature-settings:\"palt\" 1;\n  -webkit-text-size-adjust:100%; font-family:inherit;\n}\n*{box-sizing:border-box}\n.oka{color:var(--ink);font-size:16px;line-height:1.8;font-weight:400;font-style:normal;\n  letter-spacing:normal;word-spacing:normal;text-align:left;text-indent:0;text-transform:none;\n  white-space:normal;font-variant:normal;visibility:visible}\nimg{max-width:100%}\n.cta .ctabtn{display:inline-block;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer;\n  border:0;border-radius:4px;padding:11px 22px;background:var(--brand);color:#fff;text-decoration:none}\n.cta .ctabtn:hover{background:var(--brand-2)}\n  /* ============ ここから商品（貼りつける窓） ============ */\n  /* 「ここが商品」を示す札。黒地に金文字のステッカーはやめて、罫線の注釈にする */\n  .embed-label{margin:34px auto 10px;font-size:11.5px;color:var(--muted);display:flex;align-items:center;\n               gap:13px;flex-wrap:wrap;line-height:1.7}\n  .embed-label b{color:var(--accent);font-weight:700;letter-spacing:.09em;white-space:nowrap;font-size:12px}\n  .embed-label .rule{flex:1 1 40px;height:1px;background:var(--line);min-width:24px}\n  @media (max-width:600px){ .embed-label .rule{display:none} }\n\n  .oka{max-width:940px;margin:0 auto;padding:0 20px}\n  .oka-box{background:var(--card);border:1px solid var(--line);border-radius:6px;overflow:hidden}\n\n  .oka-head{padding:20px 24px 18px;border-bottom:1px solid var(--line-2)}\n  .oka-head .eyebrow{font-size:10.5px;letter-spacing:.16em;font-weight:700;color:var(--brand);margin:0 0 5px}\n  .oka-head h3{margin:0;font-size:19px;font-weight:700;letter-spacing:.01em}\n  .oka-head .desc{margin:5px 0 0;font-size:13px;color:var(--muted);line-height:1.7}\n  .oka-head .desc b{color:var(--ink-2)}\n\n  .oka-body{padding:20px 24px 24px}\n  .oka-form{display:flex;gap:9px;flex-wrap:wrap}\n  .oka-form input[type=text]{flex:1 1 250px;min-width:0;font:inherit;font-size:15px;padding:13px 15px;\n                             border:1px solid var(--line);border-radius:4px;background:#fff;color:var(--ink)}\n  .oka-form input[type=text]:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px var(--tint)}\n  .oka-form button{font:inherit;font-size:15px;font-weight:700;cursor:pointer;border:0;border-radius:4px;\n                   padding:13px 30px;background:var(--brand);color:#fff;transition:.15s}\n  .oka-form button:hover{background:var(--brand-2)}\n  .oka-hint{margin:9px 0 0;font-size:12px;color:var(--muted)}\n  .chips{margin:11px 0 0;display:flex;gap:7px;flex-wrap:wrap}\n  .chips button{font:inherit;font-size:12px;cursor:pointer;border:1px solid var(--line);background:#fff;\n                color:var(--muted);border-radius:99px;padding:5px 13px;transition:.15s}\n  .chips button:hover{border-color:var(--brand);color:var(--brand);background:var(--tint)}\n\n  .result{margin-top:26px;display:none}\n  .result.on{display:block}\n\n  /* 街の名前と県内順位 */\n  .rhead{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;\n         padding-bottom:14px;border-bottom:2px solid var(--brand)}\n  .rhead .nm{font-size:26px;font-weight:700;line-height:1.3;letter-spacing:.01em}\n  .rhead .pf{font-size:12.5px;color:var(--muted);font-weight:400;margin-left:8px}\n  .rank{text-align:right;min-width:150px;flex:0 0 auto}\n  .rank .lab{font-size:10.5px;letter-spacing:.1em;color:var(--muted);font-weight:700}\n  .rank .val{font-size:13px;font-weight:700;margin-top:1px;color:var(--muted)}\n  .rank .val em{font-style:normal;font-size:22px;color:var(--brand)}\n  .rankbar{height:3px;background:var(--line-2);border-radius:99px;overflow:hidden;margin-top:6px}\n  .rankbar i{display:block;height:100%;background:var(--brand)}\n\n  /* 節の見出し */\n  .sec{margin-top:30px}\n  .sec > h4{display:flex;align-items:center;gap:10px;margin:0 0 12px;font-size:14.5px;font-weight:700;\n            letter-spacing:.02em;color:var(--ink)}\n  .sec > h4 i{flex:0 0 auto;font-style:normal;font-size:10.5px;font-weight:700;letter-spacing:.06em;\n              color:#fff;background:var(--brand);border-radius:3px;padding:3px 8px;line-height:1.4}\n  .sec > h4 s{flex:1 1 20px;height:1px;background:var(--line);text-decoration:none;min-width:10px}\n  .sec > h4 u{flex:0 0 auto;text-decoration:none;font-size:10.5px;font-weight:700;letter-spacing:.02em;\n              color:var(--accent);white-space:nowrap}\n  .note{font-size:11.5px;color:var(--muted);line-height:1.75;margin:9px 0 0}\n  .note b{color:var(--ink-2)}\n  .nodata{font-size:12.5px;color:var(--muted);background:var(--tint);border-radius:4px;padding:11px 14px;line-height:1.75}\n\n  /* 主役＝土地の高さ */\n  .hero-metric{border:1px solid var(--line);border-left:3px solid var(--accent);\n               border-radius:5px;padding:18px 20px 20px;background:var(--tint)}\n  .hero-metric .nums{display:flex;align-items:baseline;gap:6px 26px;flex-wrap:wrap}\n  .hero-metric .n1{font-size:34px;font-weight:700;line-height:1.1;letter-spacing:-.02em;font-variant-numeric:tabular-nums}\n  .hero-metric .n1 s{text-decoration:none;font-size:17px;font-weight:700;margin-left:2px}\n  .hero-metric .n1 small{display:block;font-size:10.5px;letter-spacing:.1em;font-weight:700;color:var(--muted);\n                         margin-bottom:1px}\n  .hero-metric .n2{font-size:13px;color:var(--ink-2)}\n  .hero-metric .n2 b{font-size:20px;font-variant-numeric:tabular-nums;letter-spacing:-.01em}\n\n  /* 標高＝断面図。棒グラフではなく「海の上に地面がどれだけ乗っているか」に見せる。\n     水は半透明にして重ねるので、海面より低い地面は自動的に「水に沈んで」見える。 */\n  .xsec{margin-top:15px}\n  .xsec .plot{position:relative;height:172px;overflow:hidden;border:1px solid var(--line);border-radius:4px;\n              background:linear-gradient(180deg,#fcfdfe 0%,#f2f6f9 100%)}\n  .xsec .ground{position:absolute;z-index:1;background:linear-gradient(180deg,#d6c19b 0%,#a98f68 100%);\n                border:1px solid #93764c;border-radius:3px 3px 0 0}\n  .xsec .water{position:absolute;left:0;right:0;bottom:0;z-index:2;border-top:2px solid #5f9dc4;\n               background:linear-gradient(180deg,rgba(133,186,219,.62) 0%,rgba(96,152,190,.8) 100%)}\n  .xsec .sealab{position:absolute;left:10px;z-index:4;font-size:10px;font-weight:700;color:#1f4c6b;\n                letter-spacing:.05em;margin-top:4px}\n  .xsec .ref{position:absolute;left:0;right:0;z-index:3;border-top:1px dashed #bfa87c}\n  .xsec .ref span{position:absolute;right:7px;top:-16px;font-size:10px;color:#8f7c53;\n                  background:rgba(255,255,255,.9);padding:0 5px;border-radius:2px}\n  .xsec .cap{position:absolute;z-index:4;font-size:10.5px;color:var(--muted);line-height:1.45;\n             white-space:nowrap;background:rgba(255,255,255,.92);border-radius:2px;padding:1px 5px}\n  .xsec .cap b{display:block;font-size:15px;color:var(--ink);font-variant-numeric:tabular-nums;letter-spacing:-.01em}\n  .xsec .col-a{left:4%;width:28%} .xsec .col-b{left:36%;width:28%} .xsec .col-c{left:68%;width:28%}\n  .xsec .legend{font-size:11.5px;color:var(--muted);margin-top:10px;line-height:1.75}\n  .xsec .legend b{color:var(--ink-2)}\n\n  /* 海抜3m未満の地点の割合 */\n  .lowbar{margin-top:13px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--ink-2)}\n  .lowbar .track{flex:1 1 160px;min-width:120px;height:9px;border-radius:99px;background:#e7eef3;overflow:hidden}\n  .lowbar .track i{display:block;height:100%;background:linear-gradient(90deg,#7fb4d6,#3f7fa8)}\n  .lowbar b{font-variant-numeric:tabular-nums}\n\n  /* 災害リスクの地図 */\n  .haztabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}\n  .haztabs button{font:inherit;font-size:12.5px;cursor:pointer;border:1px solid var(--line);background:#fff;\n                  color:var(--ink-2);border-radius:4px;padding:7px 14px;transition:.15s}\n  .haztabs button:hover{border-color:var(--brand);color:var(--brand)}\n  .haztabs button[aria-pressed=\"true\"]{background:var(--brand);border-color:var(--brand);color:#fff;font-weight:700}\n  .hazmap{position:relative;height:290px;overflow:hidden;border:1px solid var(--line);border-radius:5px;background:#eef1f3}\n  .hazmap .layer{position:absolute;top:0;right:0;bottom:0;left:0}\n  .hazmap .layer img{position:absolute;width:256px;height:256px;max-width:none;display:block}\n  .hazmap .over img{opacity:.72}\n  .hazmap .pin{position:absolute;left:50%;top:50%;width:15px;height:15px;margin:-7.5px 0 0 -7.5px;z-index:5;\n               border-radius:50%;background:#c0392b;border:2.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.3)}\n  .hazmap .att{position:absolute;right:0;bottom:0;z-index:6;font-size:10px;color:#333;\n               background:rgba(255,255,255,.82);padding:1px 6px;border-radius:3px 0 0 0}\n  .hazleg{font-size:11.5px;color:var(--ink-2);margin:10px 0 0;line-height:1.8}\n  .hazleg i{display:inline-block;width:11px;height:11px;border-radius:2px;vertical-align:-1px;margin-right:4px;\n            border:1px solid rgba(0,0,0,.2)}\n  .hazleg .y{background:#f5e05a} .hazleg .r{background:#e08b8b} .hazleg .d{background:#8fb8d8}\n\n  /* 相場の表 */\n  .tbl{width:100%;border-collapse:collapse;font-size:13px;line-height:1.7}\n  .tbl th,.tbl td{border-bottom:1px solid var(--line-2);padding:11px 10px;text-align:left;vertical-align:middle}\n  .tbl thead th{font-size:10.5px;letter-spacing:.09em;color:var(--muted);border-bottom:1px solid var(--line);\n                padding-bottom:7px;font-weight:700;white-space:nowrap}\n  .tbl tbody th{font-weight:700;color:var(--ink);white-space:nowrap;font-size:12.5px}\n  .tbl tbody th span{font-weight:400;color:var(--muted);font-size:10.5px;display:block;line-height:1.5}\n  .tbl .v{font-size:16px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;letter-spacing:-.01em}\n  .tbl .v s{text-decoration:none;font-size:11px;font-weight:700;color:var(--muted);margin-left:1px}\n  .tbl .g{color:var(--ink-2);font-variant-numeric:tabular-nums;white-space:nowrap}\n  .tbl .c{color:var(--muted);font-size:11.5px;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}\n  .tbl .na{color:var(--muted);font-size:12px}\n  .tbl tr.few .c{color:#a9762b}\n  .tblscroll{overflow-x:auto;-webkit-overflow-scrolling:touch}\n  .tblscroll .tbl{min-width:440px}\n\n  /* 町ごとの相場 */\n  .towns{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:1px;\n         background:var(--line);border:1px solid var(--line);border-radius:5px;overflow:hidden}\n  .towns div{background:#fff;padding:10px 12px;font-size:12.5px;display:flex;align-items:baseline;\n             justify-content:space-between;gap:8px}\n  .towns div b{font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n  .towns div span{color:var(--ink-2);font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:700}\n  .towns div span s{text-decoration:none;color:var(--muted);font-weight:400;font-size:10.5px;margin-left:3px}\n  .more{margin-top:10px;font:inherit;font-size:12.5px;cursor:pointer;background:#fff;color:var(--brand);\n        border:1px solid var(--line);border-radius:4px;padding:8px 16px}\n  .more:hover{border-color:var(--brand);background:var(--tint)}\n\n  /* 街のつくり・暮らし */\n  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:1px;\n        background:var(--line);border:1px solid var(--line);border-radius:5px;overflow:hidden}\n  .cell{background:#fff;padding:15px 17px 16px}\n  .cell h5{margin:0 0 7px;font-size:10.5px;color:var(--muted);font-weight:700;letter-spacing:.11em}\n  .cell .big{font-size:23px;font-weight:700;line-height:1.2;letter-spacing:-.02em;font-variant-numeric:tabular-nums}\n  .cell .big s{text-decoration:none;font-size:13px;margin-left:1px}\n  .cell .big.txt{font-size:17px;letter-spacing:0}\n  .cell .sub{font-size:11.5px;color:var(--muted);margin-top:6px;line-height:1.65}\n  .cell .sub b{color:var(--ink-2)}\n  .up{color:#b6412f} .down{color:#2a6a99} .flat{color:var(--ink)}\n\n  /* 用途地域の帯 */\n  .youto{display:flex;height:10px;border-radius:99px;overflow:hidden;margin:2px 0 9px;background:var(--line-2)}\n  .youto i{display:block;height:100%}\n  .youtolist{font-size:12px;color:var(--ink-2);line-height:1.9}\n  .youtolist span{display:inline-block;margin-right:14px;white-space:nowrap}\n  .youtolist em{font-style:normal;display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}\n\n  .srcnote{margin-top:16px;font-size:11.5px;color:var(--muted);line-height:1.8}\n  .srcnote b{color:var(--ink-2)}\n\n  /* 相談ボタン（査定ではない）— 数字を全部見せたあと、いちばん最後に置く */\n  .cta{margin-top:28px;border:1px solid var(--line);border-top:3px solid var(--brand);border-radius:5px;\n       padding:22px;background:#fff}\n  .cta h4{margin:0 0 4px;font-size:16.5px;font-weight:700}\n  .cta .why{margin:0 0 14px;font-size:13px;color:var(--muted);line-height:1.75}\n  .cta .why b{color:var(--ink-2)}\n  .cta form{display:flex;gap:8px;flex-wrap:wrap}\n  .cta input{flex:1 1 170px;min-width:0;font:inherit;font-size:14.5px;padding:11px 13px;\n             border:1px solid var(--line);border-radius:4px}\n  .cta input:focus{outline:none;border-color:var(--brand)}\n  .cta button{font:inherit;font-size:14.5px;font-weight:700;cursor:pointer;border:0;border-radius:4px;\n              padding:11px 26px;background:var(--brand);color:#fff;transition:.15s}\n  .cta button:hover{background:var(--brand-2)}\n  .cta .privacy{margin:11px 0 0;font-size:11px;color:var(--muted);line-height:1.75}\n  .sent{display:none;margin-top:13px;background:var(--tint);border-left:3px solid var(--brand);\n        color:var(--ink-2);border-radius:3px;padding:12px 15px;font-size:13px;line-height:1.75}\n  .sent.on{display:block}\n\n  .notfound{display:none;margin-top:18px;background:#fdf8ec;border:1px solid #ead9ac;border-left:3px solid #c9a13f;\n            border-radius:4px;padding:14px 17px;font-size:13.5px;color:#5f4a15;line-height:1.95}\n  .notfound.on{display:block}\n  .notfound a{color:#8a6410;font-weight:700;text-decoration:none;border-bottom:1px solid rgba(138,100,16,.35);\n              display:inline-block;margin:0 10px 4px 0}\n  .notfound a:hover{background:rgba(201,161,63,.14)}\n\n  .oka-foot{border-top:1px solid var(--line-2);padding:14px 24px;font-size:11px;color:var(--muted);\n            background:#fcfbf9;line-height:1.8}\n  /* ============ 商品ここまで ============ */\n\n  .after{max-width:940px;margin:44px auto 0;padding:0 20px}\n  .after h2{font-size:17px;margin:0 0 10px;font-weight:700}\n  .after ul{margin:0;padding-left:1.25em;color:var(--muted);font-size:14px}\n  footer.site{margin-top:52px;background:var(--brand-2);color:rgba(255,255,255,.66);padding:26px 0;font-size:12.5px}\n\n  /* ============ 解説（黒帯・デモ用） ============ */\n  .explain{background:#22211f;color:#c9c4ba;padding:40px 0 46px;font-size:14px;line-height:1.95}\n  .explain h2{color:#fff;font-size:19px;margin:0 0 14px;font-weight:700}\n  .explain h3{color:#f0c96b;font-size:14px;margin:30px 0 10px;font-weight:700;letter-spacing:.04em}\n  .explain b{color:#f0c96b;font-weight:700}\n  .explain ul{padding-left:1.2em;margin:10px 0 0}\n  .explain li{margin-bottom:7px}\n  .explain p{margin:0 0 10px}\n  .tag{background:#191817;border:1px solid #45423d;border-radius:5px;padding:14px 16px;margin:12px 0 0;\n       font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;color:#9fd5ae;\n       overflow-x:auto;white-space:pre;line-height:1.7}\n  .cmp{width:100%;border-collapse:collapse;margin-top:12px;font-size:12.5px;line-height:1.7;min-width:600px}\n  .cmp th,.cmp td{border:1px solid #45423d;padding:9px 11px;text-align:left;vertical-align:top}\n  .cmp thead th{background:#302e2b;color:#fff;font-size:11.5px;letter-spacing:.04em}\n  .cmp thead th span{font-weight:400;color:#a09a90}\n  .cmp tbody th{background:#2a2926;color:#b0aba1;font-weight:700;font-size:11.5px;white-space:nowrap}\n  .cmp .ours{background:#2c332c;color:#e8e3d8}\n  .cmp .ours b{color:#8fd6a4}\n  .cmp .none{color:#e0a08e}\n  .cmpscroll{overflow-x:auto;-webkit-overflow-scrolling:touch}\n  .verdict{margin-top:26px;border-left:3px solid #f0c96b;padding:4px 0 4px 16px;color:#e6e1d6;font-size:15px}\n\n  @media (max-width:600px){\n    .hero h1{font-size:21px}\n    .oka-head,.oka-body{padding-left:17px;padding-right:17px}\n    .oka-foot{padding-left:17px;padding-right:17px}\n    .rhead .nm{font-size:22px}\n    .rank{text-align:left;min-width:0;width:100%}\n    .hero-metric .n1{font-size:27px}\n    .oka-form input[type=text]{flex:1 1 100%}\n    .oka-form button{flex:1 1 100%}     /* 縦積みになったとき半端な幅のボタンにしない */\n    .sec > h4 u{display:none}           /* 見出し右肩の注記はスマホでは折り返しの元になる */\n    .hazmap{height:230px}\n    .towns{grid-template-columns:repeat(auto-fill,minmax(138px,1fr))}\n  }" + '<\/style>' + "  <div class=\"oka\">\n    <div class=\"oka-box\">\n      <div class=\"oka-head\">\n        <p class=\"eyebrow\" id=\"weyebrow\">みどり不動産</p>\n        <h3>街データ</h3>\n        <p class=\"desc\">住所を入れると、その街の<b>土地の高さ</b>・<b>災害リスク</b>・<b>町ごとの成約価格</b>がまとめて出ます。</p>\n      </div>\n      <div class=\"oka-body\">\n        <div class=\"oka-form\">\n          <input type=\"text\" id=\"addr\" placeholder=\"例：兵庫県芦屋市○○町1-2-3\" autocomplete=\"off\">\n          <button type=\"button\" id=\"go\">調べる</button>\n        </div>\n        <p class=\"oka-hint\">市区町村まで入れば大丈夫です。番地は無くても出ます。</p>\n        <div class=\"chips\" id=\"chips\"></div>\n\n        <div class=\"notfound\" id=\"notfound\"></div>\n\n        <div class=\"result\" id=\"result\">\n          <div class=\"rhead\">\n            <div><span class=\"nm\" id=\"rmuni\"></span><span class=\"pf\" id=\"rpref\"></span></div>\n            <div class=\"rank\">\n              <div class=\"lab\" id=\"ranklab\">県内の地価順位</div>\n              <div class=\"val\"><em id=\"rankpos\"></em> <span id=\"ranktot\"></span></div>\n              <div class=\"rankbar\"><i id=\"bar\"></i></div>\n            </div>\n          </div>\n\n          <!-- 1. 主役。他社が出していない数字をいちばん上に置く -->\n          <div class=\"sec\">\n            <h4><i>1</i>この街の土地の高さ<s></s><u id=\"elev-src\">国土地理院</u></h4>\n            <div class=\"hero-metric\">\n              <div class=\"nums\">\n                <div class=\"n1\"><small>調査地点の中央値</small><span id=\"v-elev\">—</span></div>\n                <div class=\"n2\">いちばん低い地点 <b id=\"v-elevmin\">—</b></div>\n                <div class=\"n2\">いちばん高い地点 <b id=\"v-elevmax\">—</b></div>\n              </div>\n              <div class=\"xsec\" id=\"xsec\">\n                <div class=\"plot\">\n                  <div class=\"ground col-a\" id=\"xs-ga\"></div>\n                  <div class=\"ground col-b\" id=\"xs-gb\"></div>\n                  <div class=\"ground col-c\" id=\"xs-gc\"></div>\n                  <div class=\"water\" id=\"xs-water\"></div>\n                  <div class=\"ref\" id=\"xs-ref\"><span>海抜3m</span></div>\n                  <div class=\"sealab\" id=\"xs-sealab\">海面（海抜0m）</div>\n                  <div class=\"cap col-a\" id=\"xs-ca\">最も低い地点<b id=\"xs-na\">—</b></div>\n                  <div class=\"cap col-b\" id=\"xs-cb\">中央値<b id=\"xs-nb\">—</b></div>\n                  <div class=\"cap col-c\" id=\"xs-cc\">最も高い地点<b id=\"xs-nc\">—</b></div>\n                </div>\n                <div class=\"lowbar\" id=\"lowbar\"></div>\n                <p class=\"legend\" id=\"xs-legend\"></p>\n                <p class=\"note\" id=\"elevnote\"></p>\n              </div>\n            </div>\n          </div>\n\n          <!-- 2. 災害リスク -->\n          <div class=\"sec\">\n            <h4><i>2</i>災害リスクを地図で見る<s></s><u>ハザードマップポータル</u></h4>\n            <div class=\"haztabs\" id=\"haztabs\">\n              <button type=\"button\" data-h=\"flood\" aria-pressed=\"true\">洪水</button>\n              <button type=\"button\" data-h=\"tsunami\" aria-pressed=\"false\">津波</button>\n              <button type=\"button\" data-h=\"landslide\" aria-pressed=\"false\">土砂災害</button>\n              <button type=\"button\" data-h=\"none\" aria-pressed=\"false\">重ねない</button>\n            </div>\n            <div class=\"hazmap\" id=\"hazmap\">\n              <div class=\"layer base\" id=\"haz-base\"></div>\n              <div class=\"layer over\" id=\"haz-over\"></div>\n              <div class=\"pin\"></div>\n              <div class=\"att\">地理院タイル</div>\n            </div>\n            <p class=\"hazleg\" id=\"hazleg\"></p>\n            <p class=\"note\">赤い印は<b>街のまん中あたり</b>で、番地ごとの判定ではありません。\n              実際に買う・借りる土地の色は、その番地で必ず確かめてください。</p>\n          </div>\n\n          <!-- 3. 相場（5種別＋賃貸） -->\n          <div class=\"sec\">\n            <h4><i>3</i>この街の相場<s></s><u>国土交通省 実取引</u></h4>\n            <div class=\"tblscroll\">\n              <table class=\"tbl\">\n                <thead><tr><th>種別</th><th>単価の中央値</th><th>総額の目安</th><th style=\"text-align:right\">件数</th></tr></thead>\n                <tbody id=\"souba\"></tbody>\n              </table>\n            </div>\n            <p class=\"note\" id=\"soubanote\"></p>\n          </div>\n\n          <!-- 4. 町ごと -->\n          <div class=\"sec\">\n            <h4><i>4</i>町ごとに、実際いくらで売れたか<s></s><u>町丁目まで</u></h4>\n            <div id=\"townwrap\"></div>\n          </div>\n\n          <!-- 5. 街のつくり -->\n          <div class=\"sec\">\n            <h4><i>5</i>街のつくり<s></s><u>地価公示の調査地点から</u></h4>\n            <div id=\"youtowrap\"></div>\n            <div class=\"grid\" id=\"tsukuri\"></div>\n          </div>\n\n          <!-- 6. 暮らし -->\n          <div class=\"sec\">\n            <h4><i>6</i>暮らしの数字<s></s></h4>\n            <div class=\"grid\" id=\"kurashi\"></div>\n          </div>\n\n          <p class=\"srcnote\" id=\"srcnote\"></p>\n\n          <!-- ここでようやく相談。数字を全部見せたあとに置く -->\n          <div class=\"cta\">\n            <h4>この街のことを、もう少し詳しく聞く</h4>\n            <p class=\"why\">ここまでは国が公開している数字です。<b>道の広さ・日当たり・実際の売り出し状況・学区の評判</b>は、\n              地元でないと分かりません。<br>\n              <span id=\"ctaco\">この街</span>のことは、地元の店にそのまま聞けます。</p>\n            <a class=\"ctabtn\" id=\"ctabtn\" href=\"#\" rel=\"nofollow\">この街について聞く</a>\n            <p class=\"privacy\" id=\"ctapriv\">このページはお名前もメールアドレスも受け取りません。\n              ボタンを押すと、いつもの問い合わせページへ移ります。</p>\n            <div class=\"sent\" id=\"sent\"></div>\n          </div>\n        </div>\n      </div>\n      <div class=\"oka-foot\" id=\"okafoot\"></div>\n    </div>\n  </div>";

  // ---- 色。1色もらって濃淡は計算する（相手に3色考えさせない） ----
  function okaHex(h){
    h = String(h).replace(/^#/, '').trim();
    if (/^[0-9a-fA-F]{3}$/.test(h)) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  function okaLum(c){ return (0.299*c[0] + 0.587*c[1] + 0.114*c[2]) / 255; }
  function okaRgb(a){ return 'rgb(' + a[0] + ',' + a[1] + ',' + a[2] + ')'; }
  if (okaCfg.color) {
    var okaC = okaHex(okaCfg.color);
    if (okaC) {
      // 🔴 --brand の上には必ず白文字が乗る。黄色や水色をそのまま使うと見出しが読めない。
      //    色味は保ったまま、読める濃さまで自動で落とす。
      for (var okaI = 0; okaI < 10 && okaLum(okaC) > 0.55; okaI++) {
        okaC = okaC.map(function(v){ return Math.round(v * 0.85); });
      }
      okaHost.style.setProperty('--brand', okaRgb(okaC));
      okaHost.style.setProperty('--brand-2', okaRgb(okaC.map(function(v){ return Math.round(v * 0.62); })));
      okaHost.style.setProperty('--tint',    okaRgb(okaC.map(function(v){ return Math.round(v + (255 - v) * 0.94); })));
    }
  }

  // ---- ドメイン許可リスト（ビルド時に焼き込み）。未登録のサイトでは窓を出さず、登録の案内だけ出す ----
  var OKA_HOSTS = ["art-pi.com","hikari622192-tech.github.io","localhost","127.0.0.1"];
  var okaHostName = String(location.hostname || '').toLowerCase();
  // iframe（WixのHTML埋め込みなど）では location.hostname が埋め込み元の別ドメインになる。親ページのホストも候補に入れる（2026-09-05）
  var okaCands = [okaHostName];
  try {
    if (window.top !== window) {
      var okaAO = location.ancestorOrigins;
      if (okaAO && okaAO.length) { for (var okaI = 0; okaI < okaAO.length; okaI++) okaCands.push(String(new URL(okaAO[okaI]).hostname).toLowerCase()); }
      if (document.referrer) okaCands.push(String(new URL(document.referrer).hostname).toLowerCase());
    }
  } catch (okaE) {}
  var okaMatch = function(n){ return !!n && OKA_HOSTS.some(function(h){ return n === h || n.slice(-(h.length + 1)) === '.' + h; }); };
  var okaAllowed = !okaHostName || okaCands.some(okaMatch);
  if (!okaAllowed) {
    okaRoot.innerHTML = '<div style="font:14px/1.8 sans-serif;color:#3d4643;padding:16px;border:1px solid #e4e1da;border-radius:10px;background:#faf9f6">'
      + '街データウィジェット：このサイト（' + okaHostName + '）はまだ登録されていません。'
      + '<a href="https://art-pi.com/machi-data/" target="_blank" rel="noopener" style="color:#1d5540;font-weight:700">30日無料で登録する</a></div>';
    if (window.console) console.warn('[machidata] unregistered host: ' + okaHostName);
    return;
  }

  fetch(okaBase + 'index.json').then(function(r){
    if (!r.ok) throw new Error(okaBase + 'index.json -> HTTP ' + r.status);
    return r.json();
  }).then(function(w){
    // 索引の行は「先頭4つだけ入った、fields の長さの行」にしておく。
    // こうすると描画JSは索引の行も明細の行も同じ get(r,'…') で読める。
    var okaN = w.fields.length;
    w.rows = w.rows.map(function(a){ var r = new Array(okaN); for (var i=0;i<a.length;i++) r[i]=a[i]; return r; });
    okaBoot(w);
  }).catch(function(e){
    okaRoot.innerHTML = '<p style="font:14px/1.8 sans-serif;color:#77807b;padding:14px">'
      + '街データを読み込めませんでした。時間をおいて開き直してください。<\/p>';
    if (window.console) console.error('[machidata] index', e);
  });

  function okaBoot(okaW){
    var okaIX = {}; okaW.fields.forEach(function(k,i){ okaIX[k]=i; });

    // 明細を取ってきて、索引の行にそのまま流し込む
    var okaCache = {};
    function okaHydrate(r){
      if (r.__full) return Promise.resolve(r);
      var s = r[okaIX.code];
      var okaUrl = okaBase + 'm/' + s + '.json';
      // 🔴 どのURLで転んだかを必ず残す。「読み込めません」だけだと相手先で切り分けができない。
      okaCache[s] = okaCache[s] || fetch(okaUrl).then(function(x){
        if (!x.ok) throw new Error(okaUrl + ' -> HTTP ' + x.status);
        return x.text();
      }).then(function(t){
        try { return JSON.parse(t); }
        catch (e) { throw new Error(okaUrl + ' が JSON ではない: ' + t.slice(0, 60)); }
      });
      return okaCache[s].then(function(full){
        okaW.fields.forEach(function(k,i){ if (full[k] !== undefined) r[i] = full[k]; });
        r.__full = true;
        return r;
      });
    }

      var D = okaW, F = okaW.fields, R = okaW.rows;
      var IX = {}; F.forEach(function(k,i){ IX[k]=i; });
      var get = function(r,k){ return r[IX[k]]; };
      var $ = function(id){ return okaRoot.getElementById(id); };
      var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
        return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); };

      var norm = function(s){ return String(s).replace(/[ヶヵ]/g,'ケ').replace(/\s|　/g,''); };

      // 県内順位を先に作る（坪単価の高い順）
      var byPref = {};
      R.forEach(function(r){ (byPref[get(r,'pref')] = byPref[get(r,'pref')] || []).push(r); });
      Object.keys(byPref).forEach(function(p){
        byPref[p].sort(function(a,b){ return get(b,'tsuboMan') - get(a,'tsuboMan'); });
      });

      // 政令指定都市は「神戸市東灘区」のように区で持っている。
      // 🔴「神戸市」とだけ打つ人が必ずいる。親の市名 → 区の一覧 を先に作って、区を選ばせる。
      //    ここが無いと 神戸市・大阪市・横浜市・名古屋市・札幌市・福岡市・京都市 が全部
      //    「見つかりませんでした」になる（2026-08-27に7市すべてで実測）。
      // 町丁目まで出せる市区町村の数。固定値を書かず毎回数える
      var TOWN_N = okaW.townN;

      var wardsOfCity = {};
      R.forEach(function(r){
        var m = /^(.+市)(.+区)$/.exec(get(r,'muni'));
        if (m) (wardsOfCity[m[1]] = wardsOfCity[m[1]] || []).push(r);
      });

      // 住所から市区町村を当てる。いちばん長く一致した名前を採る。
      // 「兵庫県神戸市東灘区本山中町」なら 神戸市東灘区（6文字）が 東灘区(3) より優先される。
      function find(input){
        var q = norm(input);
        if (!q) return { list: [] };
        var hits = R.filter(function(r){ return q.indexOf(norm(get(r,'muni'))) >= 0; });
        if (!hits.length) return { list: [] };
        var maxLen = Math.max.apply(null, hits.map(function(r){ return get(r,'muni').length; }));
        hits = hits.filter(function(r){ return get(r,'muni').length === maxLen; });
        if (hits.length > 1) {
          // 同名（中央区・北区など）は、入力に県名が入っていれば絞れる
          var byName = hits.filter(function(r){
            var p = get(r,'pref');
            return q.indexOf(norm(p)) >= 0 || q.indexOf(norm(p.replace(/[都道府県]$/,''))) >= 0;
          });
          if (byName.length) hits = byName;
        }
        return { list: hits };
      }

      var pct = function(v){ return v == null ? '—' : (v > 0 ? '+' : '') + v + '%'; };
      var cls = function(v){ return v == null ? 'flat' : v > 0 ? 'up' : v < 0 ? 'down' : 'flat'; };
      var num = function(v){ return Number(v).toLocaleString(); };
      // 万円を「◯億◯万円」まで丸めて読ませる。3,779万円 / 1億2,300万円 の形。
      var manEn = function(v){
        if (v == null) return '—';
        var m = Math.round(v);
        if (m < 10000) return num(m) + '万円';
        var oku = Math.floor(m / 10000), rest = Math.round((m - oku * 10000) / 10) * 10;
        return oku + '億' + (rest ? num(rest) + '万' : '') + '円';
      };

      // ===== 1. 標高を断面図で描く ================================================
      // 棒グラフに見せず「海の上に地面がどれだけ乗っているか」に見せる。
      // 🔴 標高がマイナスの街が33ある（江東区・江戸川区・新潟市・名古屋市南部・大阪市西部など）。
      //    海面の線を枠の下端に固定すると、そこが「海の上の陸」に描かれて事実と逆になる。
      //    だから海面の位置は毎回計算し、水は半透明で重ねる（低い地面は自動的に沈んで見える）。
      var PLOT_H = 172;   // .xsec .plot の高さ（CSSと合わせる）

      function drawSection(med, min, max){
        if (med == null){ $('xsec').style.display = 'none'; return; }
        $('xsec').style.display = '';
        // ⚠️ 目盛りは「最低値と中央値」だけで決める。最高地点を目盛りに入れると、
        //    芦屋（1.3 / 10.5 / 86.2m）のような街で低い2本が潰れて、いちばん大事な
        //    「海面との差」が読めなくなる（実測して作り直した）。
        //    最高地点の棒は枠からはみ出させ、数字に ↑ を付けて「枠の外まで高い」と分かるようにする。
        var vals = [med, min].filter(function(v){ return v != null; }).concat([0]);
        var hi = Math.max.apply(null, vals), lo = Math.min.apply(null, vals);
        var span = hi - lo; if (span <= 0) span = 4;      // 全部ぴったり0mの街への保険
        var topM = hi + span * 0.34;                      // 上の余白
        var botM = lo - span * 0.24;                      // 海面より下に必ず余白を作る
        var ppm  = PLOT_H / (topM - botM);                // 1mあたりのピクセル
        var base = topM * ppm;                            // 海面のy座標（枠の上端から）

        $('xs-water').style.top = base + 'px';
        $('xs-sealab').style.top = base + 'px';

        place('a', min, base, ppm);
        place('b', med, base, ppm);
        place('c', max, base, ppm);

        // 海抜3mの目安線。街全体が3mより低ければ枠外になるので出さない
        if (topM > 3){
          $('xs-ref').style.display = '';
          $('xs-ref').style.top = (base - 3 * ppm) + 'px';
        } else {
          $('xs-ref').style.display = 'none';
        }

        var mn = (min == null) ? med : min;
        $('xs-legend').innerHTML =
            (mn < 0)  ? 'この街には<b>海面より低い土地</b>があります。水の心配は<b>番地ごと</b>にハザードマップでご確認ください。'
          : (mn < 3)  ? 'この街には<b>海抜3mより低い場所</b>が含まれます。水の心配は<b>番地ごと</b>にハザードマップでご確認ください。'
                      : '海抜3mより低い場所は含まれていません。ただし川沿い・低地は番地ごとに差があります。';
      }

      // 地面1本を置く。プラスなら海面から上へ、マイナスなら海面から下へ伸ばす。
      function place(k, v, base, ppm){
        var g = $('xs-g' + k), c = $('xs-c' + k), n = $('xs-n' + k);
        if (v == null){ g.style.display = 'none'; c.style.display = 'none'; return; }
        g.style.display = ''; c.style.display = '';
        var h = Math.max(3, Math.abs(v) * ppm);
        var top = (v >= 0) ? base - h : base;
        // 枠の上に突き抜けた棒は、数字に ↑ を付けて「まだ上がある」と分かるようにする
        n.textContent = v + 'm' + (top < 0 ? ' ↑' : '');
        g.style.top = top + 'px';
        g.style.height = h + 'px';
        c.style.top = Math.max(2, top - 38) + 'px';   // ラベルは地面のすぐ上。枠から出さない
      }

      // ===== 2. 災害リスクの地図 ==================================================
      // 地理院タイルを自前で並べる（外部の地図ライブラリを読まないので、1枚のHTMLのまま動く）。
      // 出典表示は地理院の利用規約で必須なので、枠の中に焼き込んである。
      var TILE = 256, HZOOM = 13;
      var HAZ = {
        flood: { u: ['https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png'],
                 l: '<i class="d"></i>洪水浸水想定区域（想定しうる最大規模の雨）。<b>色が濃いほど深い想定</b>です。'
                  + '白いところは「想定区域の外」であって、水が来ないという意味ではありません。' },
        tsunami: { u: ['https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png'],
                 l: '<i class="d"></i>津波浸水想定。色が濃いほど深い想定です。内陸の街では何も表示されません。' },
        landslide: { u: ['https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png',
                         'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png',
                         'https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png'],
                 l: '<i class="y"></i>警戒区域　<i class="r"></i>特別警戒区域　'
                  + 'がけ崩れ・土石流・地すべりの3つを重ねています。平地の街では何も表示されません。' },
        none: { u: [], l: '重ね表示なし。地理院の標準地図だけを出しています。' }
      };
      var BASE = 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png';
      var hazMode = 'flood', hazPos = null;

      var lng2t = function(lng, z){ return (lng + 180) / 360 * Math.pow(2, z); };
      var lat2t = function(lat, z){
        var r = lat * Math.PI / 180;
        return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z);
      };

      function tiles(box, urls, lat, lng){
        box.innerHTML = '';
        if (!urls.length || lat == null) return;
        var W = box.clientWidth || 700, H = box.clientHeight || 290, n = Math.pow(2, HZOOM);
        var x0 = lng2t(lng, HZOOM) * TILE - W / 2, y0 = lat2t(lat, HZOOM) * TILE - H / 2;
        var tx0 = Math.floor(x0 / TILE), ty0 = Math.floor(y0 / TILE);
        var tx1 = Math.floor((x0 + W) / TILE), ty1 = Math.floor((y0 + H) / TILE);
        var html = '';
        for (var u = 0; u < urls.length; u++){
          for (var ty = ty0; ty <= ty1; ty++){
            if (ty < 0 || ty >= n) continue;
            for (var tx = tx0; tx <= tx1; tx++){
              var wx = ((tx % n) + n) % n;
              var src = urls[u].replace('{z}', HZOOM).replace('{x}', wx).replace('{y}', ty);
              html += '<img src="' + src + '" alt="" onerror="this.style.display=\'none\'"'
                    + ' style="left:' + (tx * TILE - x0) + 'px;top:' + (ty * TILE - y0) + 'px">';
            }
          }
        }
        box.innerHTML = html;
      }

      function drawHaz(){
        if (!hazPos) return;
        tiles($('haz-base'), [BASE], hazPos[0], hazPos[1]);
        tiles($('haz-over'), HAZ[hazMode].u, hazPos[0], hazPos[1]);
        $('hazleg').innerHTML = HAZ[hazMode].l;
      }
      Array.prototype.forEach.call($('haztabs').querySelectorAll('button'), function(b){
        b.addEventListener('click', function(){
          hazMode = b.getAttribute('data-h');
          Array.prototype.forEach.call($('haztabs').querySelectorAll('button'), function(x){
            x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
          });
          drawHaz();
        });
      });

      // ===== 3. 相場の表 ==========================================================
      // 🔴 ラベルは本番の査定ツール（estimate.js の MODE_CAPTIONS）と同じ定義に合わせる。
      //    中古戸建の坪単価は「延床面積によらない坪単価」なので、土地と同じ30坪で並べて比べられる。
      var TSUBO30 = 30;   // ⚠️ ここを 30.25 にすると「30坪」と書いた金額が合わなくなる（実際に間違えていた）
      function soubaRows(r){
        var rent = get(r,'rentSqm');
        var t = function(v, mul){ return v == null ? null : v * mul; };
        return [
          { k:'土地', s:'地価公示（国が毎年3月に出す価格）', v:get(r,'tsuboMan'), u:'万円/坪',
            t:t(get(r,'tsuboMan'), TSUBO30), tl:'30坪なら', c:get(r,'n'), cu:'地点' },
          { k:'土地', s:'実際に売れた価格（直近1年）', v:get(r,'landMed'), u:'万円/坪',
            t:t(get(r,'landMed'), TSUBO30), tl:'30坪なら', c:get(r,'landN'), cu:'件' },
          { k:'中古マンション', s:'1982年以降築のみ', v:get(r,'manMed'), u:'万円/㎡',
            t:t(get(r,'manMed'), 70), tl:'70㎡なら', c:get(r,'manN'), cu:'件' },
          { k:'新築マンション', s:'築2年以内', v:get(r,'nbManMed'), u:'万円/㎡',
            t:t(get(r,'nbManMed'), 70), tl:'70㎡なら', c:get(r,'nbManN'), cu:'件' },
          { k:'中古戸建', s:'1982年以降築・土地の坪単価', v:get(r,'houseMed'), u:'万円/坪',
            t:t(get(r,'houseMed'), TSUBO30), tl:'土地30坪なら', c:get(r,'houseN'), cu:'件' },
          { k:'新築戸建', s:'築2年以内・土地建物の総額から', v:get(r,'nbHouseMed'), u:'万円/坪',
            t:t(get(r,'nbHouseMed'), TSUBO30), tl:'土地30坪なら', c:get(r,'nbHouseN'), cu:'件' },
          // ⚠️ 家賃だけ桁が違う（1,374円/㎡）。万円に直すと 0.1万円/㎡ になって読めないので、円のまま出す。
          //    総額も 8万円 と丸めず 8.2万円 まで見せる（1万円未満の差が効く金額帯なので）。
          { k:'賃貸', s:'総務省の家賃統計（5年に1回の更新）', v:rent, u:'円/㎡', yen:1,
            t:rent == null ? null : rent * 60 / 10000, tl:'60㎡なら', c:null, cu:'', mon:1 },
        ];
      }

      function renderSouba(r){
        var out = '', few = 0, none = 0;
        soubaRows(r).forEach(function(x){
          if (x.v == null){
            none++;
            out += '<tr><th>' + esc(x.k) + '</th><td colspan="3" class="na">'
                 + 'この街では、国のデータに取引が出ていません</td></tr>';
            return;
          }
          var isFew = x.c != null && x.c < 10;
          if (isFew) few++;
          var vtxt = (x.yen || x.v >= 100) ? num(Math.round(x.v)) : (Math.round(x.v * 10) / 10);
          // 賃貸は1万円未満の差が効くので、億の丸めを通さず小数1桁で出す
          var ttxt = x.mon ? (Math.round(x.t * 10) / 10) + '万円/月' : manEn(x.t);
          out += '<tr class="' + (isFew ? 'few' : '') + '">'
               + '<th>' + esc(x.k) + '<span>' + esc(x.s) + '</span></th>'
               + '<td class="v">' + vtxt + '<s>' + esc(x.u) + '</s></td>'
               + '<td class="g">' + esc(x.tl) + ' <b>' + ttxt + '</b></td>'
               + '<td class="c">' + (x.c == null ? '—' : num(x.c) + esc(x.cu) + (isFew ? ' ⚠' : '')) + '</td></tr>';
        });
        $('souba').innerHTML = out;
        var msg = ['相場は平均ではなく<b>中央値</b>です。平均だと高額な1件に引きずられて、その街の実感とずれます。'];
        if (few) msg.push('⚠ の付いた行は<b>取引が10件に満たない</b>ので、参考値としてご覧ください。');
        if (none) msg.push('取引が出ていない種別があるのは、国のデータが<b>件数の少ない地域を伏せている</b>ためです。');
        $('soubanote').innerHTML = msg.join(' ');
      }

      // ===== 4. 町ごとの相場 ======================================================
      function renderTowns(r){
        var s = get(r,'towns');
        if (!s){
          $('townwrap').innerHTML = '<p class="nodata">この街は、国の取引データに町名が入っていません。'
            + '（' + num(R.length) + '市区町村のうち' + num(TOWN_N) + '市区町村で町丁目まで出せます）</p>';
          return;
        }
        var list = s.split('|').map(function(t){ var a = t.split(':'); return [a[0], +a[1], +a[2]]; });
        var SHOW = 12;
        function draw(all){
          var use = all ? list : list.slice(0, SHOW);
          var html = '<div class="towns">' + use.map(function(t){
            return '<div><b>' + esc(t[0]) + '</b><span>' + (Math.round(t[2] * 10) / 10)
                 + '<s>万/坪・' + t[1] + '件</s></span></div>';
          }).join('') + '</div>';
          if (!all && list.length > SHOW){
            html += '<button type="button" class="more" id="townmore">残り' + (list.length - SHOW) + '町も見る</button>';
          }
          html += '<p class="note">国土交通省が公表している<b>実際の成約価格</b>を、町丁目ごとに中央値でまとめたものです（'
                + esc(D.periodRange) + '）。件数の少ない町は1〜2件の取引で決まっているので、幅があります。</p>';
          $('townwrap').innerHTML = html;
          if (!all && list.length > SHOW) $('townmore').addEventListener('click', function(){ draw(true); });
        }
        draw(false);
      }

      // ===== 5. 街のつくり ========================================================
      var YOUTO_COL = ['#4b7f63','#7fa88c','#a8863c'];
      function renderTsukuri(r){
        // ⚠️ 分母は pointN（商業地・工業地も含む全用途の地点数）。地価や標高で使う n は住宅地だけなので、
        //    そこを取り違えると帯が2000%幅になる（大阪市中央区は 全用途45地点 に対し住宅地2地点）。
        var y = get(r,'youto'), n = get(r,'pointN');
        if (y && n){
          var parts = y.split('|').map(function(t){ var a = t.split(':'); return [a[0], +a[1]]; });
          var tot = parts.reduce(function(s,p){ return s + p[1]; }, 0);
          var other = Math.max(0, n - tot);
          var bar = parts.map(function(p,i){
            return '<i style="width:' + (p[1] / n * 100) + '%;background:' + YOUTO_COL[i] + '"></i>'; }).join('')
            + (other ? '<i style="width:' + (other / n * 100) + '%;background:#dcd8cf"></i>' : '');
          var leg = parts.map(function(p,i){
            return '<span><em style="background:' + YOUTO_COL[i] + '"></em>' + esc(p[0]) + ' ' + p[1] + '地点</span>'; }).join('')
            + (other ? '<span><em style="background:#dcd8cf"></em>その他 ' + other + '地点</span>' : '');
          $('youtowrap').innerHTML = '<div class="youto">' + bar + '</div><div class="youtolist">' + leg + '</div>'
            + '<p class="note">用途地域は<b>その土地に何が建てられるか</b>の決まりです。'
            + '「1低専」なら低層の住宅だけ、「商業」ならビルも建ちます。'
            + '国の地価公示の調査地点' + n + 'か所（住宅地だけでなく商業地・工業地も含む）での内訳です。</p>';
        } else {
          $('youtowrap').innerHTML = '';
        }

        var st = get(r,'station'), road = get(r,'road'), kp = get(r,'kenpei'), ys = get(r,'yoseki');
        var cells = [];
        if (st){
          var a = st.split(':');
          cells.push(['よく出てくる駅', '<div class="big txt">' + esc(a[0]) + '</div>',
            a[1] ? '調査地点からの距離は中央値で<b>' + num(a[1]) + 'm</b>' : '調査地点の最寄り駅です']);
        }
        if (road != null) cells.push(['前面道路の幅', '<div class="big">' + road + '<s>m</s></div>',
          '調査地点の中央値。' + (road < 4 ? '<b>4m未満</b>だと建て替えでセットバックが要ります'
                                         : '4m以上あるので建て替えの制限はゆるやかです')]);
        if (kp != null && ys != null) cells.push(['建ぺい率／容積率', '<div class="big">' + kp + '<s>%</s> / ' + ys + '<s>%</s></div>',
          '最も多い組み合わせ。<b>敷地の' + kp + '%まで建てられて、延床は' + ys + '%まで</b>という意味です']);
        $('tsukuri').innerHTML = cells.map(function(c){
          return '<div class="cell"><h5>' + c[0] + '</h5>' + c[1] + '<div class="sub">' + c[2] + '</div></div>'; }).join('');
        $('tsukuri').style.display = cells.length ? '' : 'none';
      }

      // ===== 6. 暮らし ============================================================
      function renderKurashi(r){
        var muni = get(r,'muni');
        var sc = get(r,'schools'), isP = get(r,'schoolsIsParent');
        var yoy = get(r,'yoy'), c3 = get(r,'chg3y');
        var cells = [
          ['この1年の地価', '<div class="big ' + cls(yoy) + '">' + pct(yoy) + '</div>',
            c3 == null ? '3年前との比較はデータがありません'
                       : '3年前と比べると <b class="' + cls(c3) + '">' + pct(c3) + '</b>'],
          ['小学校・中学校', sc == null ? '<div class="big">—</div>' : '<div class="big">' + sc + '<s>校</s></div>',
            sc == null ? 'この地域は学区データを持っていません'
                       : (isP ? esc(muni.replace(/(.+市).+区$/,'$1')) + '全体の小中学校の数です' : '小学校と中学校の合計')],
        ];
        $('kurashi').innerHTML = cells.map(function(c){
          return '<div class="cell"><h5>' + c[0] + '</h5>' + c[1] + '<div class="sub">' + c[2] + '</div></div>'; }).join('');
      }

      // ===== 1件を描く ============================================================
      function showNow(r){
        var pref = get(r,'pref'), muni = get(r,'muni');
        $('rmuni').textContent = muni;
        $('rpref').textContent = pref;

        var list = byPref[pref], pos = list.indexOf(r) + 1;
        $('ranklab').textContent = pref + 'の地価順位';
        $('rankpos').textContent = pos + '位';
        $('ranktot').textContent = '/ ' + list.length + '市区町村';
        $('bar').style.width = Math.max(3, (1 - (pos - 1) / Math.max(1, list.length - 1)) * 100) + '%';

        var em = get(r,'elevMed'), en = get(r,'elevMin'), ex = get(r,'elevMax');
        $('v-elev').innerHTML = em == null ? '—' : em + '<s>m</s>';
        $('v-elevmin').textContent = en == null ? '—' : en + 'm';
        $('v-elevmax').textContent = ex == null ? '—' : ex + 'm';
        drawSection(em, en, ex);

        var low3 = get(r,'low3'), n = get(r,'n');
        if (n){
          var p = Math.round(low3 / n * 100);
          $('lowbar').innerHTML = '<span>海抜3m未満の調査地点</span>'
            + '<span class="track"><i style="width:' + p + '%"></i></span>'
            + '<b>' + low3 + ' / ' + n + '地点（' + p + '%）</b>';
        } else { $('lowbar').innerHTML = ''; }

        // 🔴 標高は「地価公示の調査地点」だけを標本にしている（elevN と n は1件を除いて常に同じ）。
        //    街の最低地点ではない。地点が2か所以下の市区町村が416件、1か所だけが30件あり、
        //    その30件では「最も低い」と「中央値」が同じ1点の同じ値になる。黙って出すと土地勘のある
        //    相手に一発で崩される（この商品の一番の売りが一番脆い）。だから毎回、地点数を添える。
        $('elev-src').textContent = '国土地理院 × 調査' + n + '地点';
        $('elevnote').innerHTML = '国の地価公示の<b>調査地点（この街は' + n + 'か所）で測った高さ</b>です。'
          + '街全体の最低地点ではありません。'
          + (n <= 2 ? '<b style="color:#a9762b">この街は地点が' + n + 'か所しかないので、参考値としてご覧ください。</b>'
                    : '実際に買う土地の高さは、その番地で確かめてください。');

        var lat = get(r,'lat'), lng = get(r,'lng');
        hazPos = (lat == null) ? null : [lat, lng];
        drawHaz();

        renderSouba(r);
        renderTowns(r);
        renderTsukuri(r);
        renderKurashi(r);

        $('srcnote').innerHTML = '相場は平均ではなく<b>中央値</b>です。'
          + '出せないもの（番地ごとの浸水の深さ・個別の物件価格・地盤の強さ）は、この窓では出していません。';

        $('result').classList.add('on');
        $('notfound').classList.remove('on');
        $('sent').classList.remove('on');
      }

      // ===== 入力を受ける ==========================================================
      function pickList(label, rows){
        return label + '<br>' + rows.map(function(r){
          return '<a href="#" data-pick="' + esc(get(r,'pref') + get(r,'muni')) + '">' + esc(get(r,'muni')) + '</a>';
        }).join('');
      }

      function run(){
        var v = $('addr').value;
        var q = norm(v);
        var res = find(v);

        if (!res.list.length){
          $('result').classList.remove('on');

          // ① 政令市を市名だけで打った（神戸市／大阪市／横浜市…）→ 区を選ばせる
          var city = Object.keys(wardsOfCity).filter(function(c){ return q.indexOf(norm(c)) >= 0; })
                           .sort(function(a,b){ return b.length - a.length; })[0];
          if (city){
            $('notfound').innerHTML = pickList('<b>' + esc(city) + '</b>は区に分かれています。どちらでしょうか：',
                                               wardsOfCity[city]);
          } else {
            // ②「南区」のように、単独の自治体は無いが「◯◯市南区」なら在る入力
            var ends = q ? R.filter(function(r){
              var m = norm(get(r,'muni'));
              return m !== q && m.slice(-q.length) === q && /市$/.test(m.slice(0, m.length - q.length));
            }) : [];
            if (ends.length){
              $('notfound').innerHTML = pickList('「' + esc(v) + '」は複数の市にあります。どれでしょうか：', ends.slice(0,12))
                + (ends.length > 12 ? '　ほか' + (ends.length - 12) + '件' : '');
            } else {
              // ③ 本当に無い。「打ち間違い」扱いにせず、収録範囲を正直に書く
              $('notfound').innerHTML = '「' + esc(v) + '」では見つかりませんでした。'
                + '市区町村の名前（例：芦屋市、神戸市東灘区、世田谷区）を入れてみてください。<br>'
                + '<span style="font-size:12px">なお、この窓は<b>国の地価公示に調査地点がある' + num(R.length) + '市区町村</b>を収録しています。'
                + '調査地点の無い小さな町村は入っていません。</span>';
            }
          }
          $('notfound').classList.add('on');
          return;
        }

        if (res.list.length > 1){
          $('result').classList.remove('on');
          $('notfound').innerHTML = pickList('同じ名前の市区町村が' + res.list.length + 'つあります。どれでしょうか：', res.list);
          $('notfound').classList.add('on');
          return;
        }

        show(res.list[0]);

        // 「中央区」だけ入れると東京都中央区が出る（正式名として1件しか無いので当然そうなる）。
        // ただし神戸市中央区のつもりで打った人を黙って東京へ連れて行くと事故なので、そのときだけ注意を出す。
        var picked = get(res.list[0],'muni');
        var alsoEnds = R.filter(function(r){
          var m = get(r,'muni');
          if (m === picked || m.slice(-picked.length) !== picked) return false;
          return /市$/.test(m.slice(0, m.length - picked.length));
        });
        var typedPref = R.some(function(r){
          var p = get(r,'pref');
          return q.indexOf(norm(p)) >= 0 || q.indexOf(norm(p.replace(/[都道府県]$/,''))) >= 0;
        });
        if (alsoEnds.length && !typedPref){
          $('notfound').innerHTML = '<b>' + esc(get(res.list[0],'pref') + picked) + '</b> の結果を出しています。他の候補：'
            + alsoEnds.slice(0,8).map(function(r){
                return '<a href="#" data-pick="' + esc(get(r,'pref') + get(r,'muni')) + '">' + esc(get(r,'muni')) + '</a>';
              }).join('');
          $('notfound').classList.add('on');
        }
      }

      $('notfound').addEventListener('click', function(e){
        var t = e.target.closest ? e.target.closest('[data-pick]') : null;
        if (!t) return;
        e.preventDefault();
        $('addr').value = t.getAttribute('data-pick');
        run();
      });
      $('go').addEventListener('click', run);
      $('addr').addEventListener('keydown', function(e){ if (e.key === 'Enter') run(); });

      // 試しやすいように、実データから例をいくつか出しておく
      ['兵庫県芦屋市', '東京都江東区', '東京都世田谷区', '千葉県流山市', '神戸市'].forEach(function(s){
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = s;
        b.addEventListener('click', function(){ $('addr').value = s; run(); });
        $('chips').appendChild(b);
      });

    // ---- 上の描画JSの外側 ----------------------------------------------
    // show() は「明細を取ってから描く」に差し替える（元の同期版が showNow）
    function show(r){
      okaHydrate(r).then(showNow).catch(function(e){
        $('notfound').textContent = 'この街のデータを読み込めませんでした。';
        $('notfound').classList.add('on');
        if (window.console) console.error('[machidata]', e);
      });
    }

    // 会社名・出典・問い合わせ先
    if (okaCfg.co) { $('weyebrow').textContent = okaCfg.co; }
    else { $('weyebrow').style.display = 'none'; }
    $('ctaco').textContent = okaCfg.co || 'この街';

    var okaCta = okaRoot.querySelector('.cta');
    if (okaCfg.contact) {
      $('ctabtn').setAttribute('href', okaCfg.contact);
      $('ctabtn').textContent = okaCfg.label;
    } else {
      // 🔴 行き先の無いボタンは出さない。押せるのに何も起きないのがいちばん印象が悪い。
      okaCta.parentNode.removeChild(okaCta);
    }

    $('okafoot').innerHTML = '出典：国土交通省「不動産取引価格情報」' + esc(okaW.periodRange) + '（四半期ごとに更新）'
      + '／国土交通省「地価公示」2026年・住宅地（年1回・3月）'
      + '／国土地理院 標高API・地理院タイル・ハザードマップポータル'
      + '／総務省「住宅・土地統計調査」令和5年（5年に1回）。'
      + 'いずれも市区町村または町丁目単位の目安で、番地ごと・物件ごとの評価ではありません。'
      + '標高は浸水の深さそのものではありません。'
      + '<br>集計・配信：<a href="https://art-pi.com/machi-data/" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">おかあさんのおうち（art-pi.com）</a>';

    // data-muni が指定されていれば最初からその街を出す
    if (okaCfg.muni) {
      $('addr').value = okaCfg.muni;
      var res = find(okaCfg.muni);
      if (res.list.length) show(res.list[0]);
    }
  }
})();
