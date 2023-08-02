<?php

?>

<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>オーバーレイ画面</title>

    <!-- CSS -->
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="reset.css">

    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>


</head>

<body>
    <!-- ⭐️スタンプ表示エリア -->
    <div style="position: relative;">
        <img src="img/Sequence04.gif" style="position: absolute; top: 0px; left: 0px; z-index: 1;">
        <canvas id="overlay" width="720" height="405" style="position: absolute; top: 0; left: 0; z-index: 2;"></canvas>
    </div>

    <script type="module">
        //----------------------------------------
        // ▼firebaseプロジェクトとjavaScriptを連携させる
        //----------------------------------------

        // 必要な機能をSDKからインポート
        import {
            initializeApp
        } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";


        // firebase firestoreとやり取りをする設定
        import {
            getFirestore,
            collection,
            addDoc,
            serverTimestamp,
            query,
            orderBy, //データのソート
            onSnapshot, // Firestore 上に保存されているデータを取得
            doc,
            deleteDoc,
            updateDoc,
            where,
        } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

        // firebase storageとやり取りをする設定
        import {
            getStorage,
            ref,
            uploadBytes,
            getDownloadURL
        } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";



        // ウェブアプリのFirebaseの設定
        const firebaseConfig = {
            apiKey: "AIzaSyBs-rcINsUSZe7bD7OeLTrNcXm6-OInABg",
            authDomain: "tvcha-9cae7.firebaseapp.com",
            projectId: "tvcha-9cae7",
            storageBucket: "tvcha-9cae7.appspot.com",
            messagingSenderId: "866848033597",
            appId: "1:866848033597:web:c6887382eb14ee58351354",
        };

        // Firebaseの初期化
        const app = initializeApp(firebaseConfig);

        // FirebaseアプリとCloud Storageの連携を初期化しセットアップする
        const storage = getStorage(app);

        // dbに対してデータの追加や取得ができるようにする
        const db = getFirestore(app);

        // 🔽 データ取得条件の指定（今回は時間の新しい順に並び替えて取得）
        const q = query(collection(db, "tvcha"), orderBy("time", "desc"));

        // クリックされたスタンプのURLを格納する配列
        let clickStamp = "";
        const clickStamps = [];
        const canvas = document.getElementById('overlay');

        const ctx = canvas.getContext('2d');
        const stamps = []; // スタンプの情報を保持する配列



        console.log("stamps", stamps);

        // データ取得処理(データベース上でデータの変更が発生したタイミングで {} 内の処理を実行)
        onSnapshot(q, (querySnapshot) => {
            const documents = [];

            querySnapshot.docs.forEach(function(doc) { //docsは配列 docはオブジェクト
                const document = {
                    id: doc.id, //ドキュメントID
                    data: doc.data(), //ドキュメントの配列データ
                };
                documents.push(document); //配列の先頭に追加 

            });

            querySnapshot.docChanges().forEach((change) => {

                clickStamp = change.doc.data().img;
                clickStamps.push(clickStamp);
                // console.log("クリックされたスタンプ配列", clickStamps);

                drawImageOnCanvas(); // 画像をCanvas上に描画

            });

            const countData = []; // countDataを初期化しておく
            const imageUrls = []; // imageUrlsを初期化しておく


            //----------------------------------------
            // id: 'ドキュメントのID',
            // data: {
            //      img: '画像のURL',
            //      point: 'ポイント',
            //      count: 'カウント',
            //      time: '作成日時など'
            //      clickStamps: 'クリックされたスタンプのURL配列'
            // countData : 'カウントの配列',
            // imageUrls : '画像のURLの配列'
            //----------------------------------------

            //----------------------------------------
            // ドキュメントをループしてcountDataとimageUrlsを作成
            //----------------------------------------
            documents.forEach((document, index) => {
                const {
                    count,
                    img
                } = document.data;
                countData.push(count);
                imageUrls.push(img);
            });

            // console.log("countData", countData);

            //----------------------------------------
            // ▼スタンプが画面中央に来る
            //----------------------------------------

            function drawImageOnCanvas() {
                const image = new Image();
                image.onload = function() {
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    // console.log("centerX", centerX, "centerY", centerY);
                    // console.log(canvas.height);

                    let posX, posY;
                    let velocityX = (centerX - posX) * 0.05;
                    let velocityY = (centerY - posY) * 0.05;

                    if (Math.random() < 0.5) {
                        posX = Math.random() * canvas.width;
                        posY = Math.random() < 0.5 ? 0 : canvas.height;
                    } else {
                        posX = Math.random() < 0.5 ? 0 : canvas.width;
                        posY = Math.random() * canvas.height;
                    }
                    // console.log("posX", posX, "posY", posY);

                    // console.log("velocityX", velocityX, "velocityY", velocityY);

                    const stampInfo = {
                        image: image,
                        posX: posX,
                        posY: posY,
                        velocityX: (centerX - posX) * 0.01,
                        velocityY: (centerY - posY) * 0.01,
                    };
                    stamps.push(stampInfo);
                    console.log("stamps", stamps);

                    function animate() {
                        // 背景を赤色に塗りつぶす

                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        // 背景色を赤色に設定し、アルファチャンネルを持たせる（透明度0.5）
                        ctx.fillStyle = "rgba(0, 0, 0, 0)";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        for (const stamp of stamps) {
                            stamp.posX += stamp.velocityX;
                            stamp.posY += stamp.velocityY;

                            //----------------------------------------
                            // ▼衝突関数
                            //----------------------------------------
                            // const canvasRight = canvas.width - stamp.image.width;
                            // const canvasBottom = canvas.height - stamp.image.height;
                            // const collisionDampingFactor = 0.5; // 衝突時の速度の減衰係数（0に近づくほど跳ね返りが小さくなる）

                            // // 衝突時の速度反転と減衰
                            // if (stamp.posX < 0) {
                            //     stamp.posX = 0;
                            //     stamp.velocityX *= -collisionDampingFactor;
                            // } else if (stamp.posX > canvasRight) {
                            //     stamp.posX = canvasRight;
                            //     stamp.velocityX *= -collisionDampingFactor;
                            // }

                            // if (stamp.posY < 0) {
                            //     stamp.posY = 0;
                            //     stamp.velocityY *= -collisionDampingFactor;
                            // } else if (stamp.posY > canvasBottom) {
                            //     stamp.posY = canvasBottom;
                            //     stamp.velocityY *= -collisionDampingFactor;
                            // }

                            // const minDistance = 100; // 画像同士の最小距離を大きくすることで、衝突を回避する距離を広げる
                            // for (let i = 0; i < stamps.length; i++) {
                            //     if (stamp === stamps[i]) continue;
                            //     const stamp2 = stamps[i];
                            //     const dx = stamp2.posX - stamp.posX;
                            //     const dy = stamp2.posY - stamp.posY;
                            //     const distance = Math.sqrt(dx * dx + dy * dy);
                            //     if (distance < minDistance) {
                            //         const angle = Math.atan2(dy, dx);
                            //         const targetX = stamp2.posX - Math.cos(angle) * minDistance;
                            //         const targetY = stamp2.posY - Math.sin(angle) * minDistance;
                            //         stamp2.posX = targetX;
                            //         stamp2.posY = targetY;
                            //         // 衝突後の速度を減衰させる
                            //         stamp.velocityX *= collisionDampingFactor;
                            //         stamp.velocityY *= collisionDampingFactor;
                            //         stamp2.velocityX *= collisionDampingFactor;
                            //         stamp2.velocityY *= collisionDampingFactor;
                            //     }
                            // }
                            //----------------------------------------
                            // ▼画面中央にきたら止まる関数
                            //----------------------------------------


                            const distanceToCenter = Math.sqrt((canvas.width / 2 - stamp.posX) ** 2 + (canvas.height / 2 - stamp.posY) ** 2);
                            const dampingFactor = Math.min(1, distanceToCenter / 200);
                            stamp.velocityX *= dampingFactor;
                            stamp.velocityY *= dampingFactor;

                            ctx.drawImage(stamp.image, stamp.posX, stamp.posY, 50, 50);

                            if (Math.abs(stamp.velocityX) < 0.1 && Math.abs(stamp.velocityY) < 0.1) {
                                stamp.velocityX = 0;
                                stamp.velocityY = 0;
                            }
                        }

                        // 次のフレームの描画をリクエスト
                        requestAnimationFrame(animate);
                    }

                    // アニメーションを開始
                    animate();
                };

                image.src = clickStamps[clickStamps.length - 1]; // clickStampsに画像のURLが格納されていると仮定しています
            }


            //----------------------------------------
            // ▼スタンプが放物線を描く
            //----------------------------------------

            // clickStampが更新されたら描画するための関数
            function drawImageOnCanvas() {

                const image = new Image();
                image.onload = function() {
                    let posX = 0; // 初期位置をCanvasの左端に設定
                    let posY = canvas.height; // 初期位置をCanvasの底辺に設定
                    let velocityY = -18; // 初速度を設定（下向きのため負の値）
                    const gravity = 0.5; // 重力の影響を表す定数

                    function animate() {

                        ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvasをクリア

                        // 位置を更新
                        posX += 8; // 速度による位置の変化
                        velocityY += gravity; // 重力による速度の増加
                        posY += velocityY; // 速度による位置の変化

                        // スタンプを描画
                        ctx.drawImage(image, posX, posY, 100, 100);


                        //----------------------------------------
                        // ▼スタンプを黒く塗りつぶすコード
                        //----------------------------------------

                        // ctx.globalCompositeOperation = 'source-over'; // 通常の描画モード
                        // ctx.drawImage(image, posX, posY, 100, 100);
                        // ctx.globalCompositeOperation = "source-atop";
                        // ctx.fillStyle = 'black';
                        // ctx.fillRect(posX, posY, 100, 100);
                        // 次のフレームの描画をリクエスト
                        requestAnimationFrame(animate);
                    }

                    // アニメーションを開始
                    animate();

                };
                image.src = clickStamps[clickStamps.length - 1]; // clickStampsに画像のURLが格納されていると仮定しています
            }
        });
    </script>
</body>

</html>