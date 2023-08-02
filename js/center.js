//----------------------------------------
// ▼スタンプが画面中央に来る
//----------------------------------------

function drawImageOnCanvas() {
    const image = new Image();
    image.onload = function() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        // console.log("centerX", centerX, "centerY", centerY);
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
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
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
                const dampingFactor = Math.min(1, distanceToCenter / 150);
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