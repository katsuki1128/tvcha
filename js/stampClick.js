//----------------------------------------
// ▼スタンプがクリックされた時にfirebase上でのクリック数とポイント数を更新する
//----------------------------------------

const stampClick = async (data, collection1, docId1, collection2, docId2) => {
    try {
        const currentCount = data.count;
        const consumptionPoint = data.point;

        const updatedCount = currentCount + 1;

        // Firestoreのドキュメントを更新
        await updateDoc(doc(db, collection1, docId1), {
            count: updatedCount
        });

        // Firestoreからcollection2とdocId2で指定されるドキュメントを取得
        const docSnapshot = await getDoc(doc(db, collection2, docId2));
        if (docSnapshot.exists()) {
            const { point } = docSnapshot.data();

            // ドキュメントのpointを使用して更新
            await updateDoc(doc(db, collection2, docId2), {
                point: point - consumptionPoint
            });

            console.log("カウントが正常に更新されました。");
        } else {
            console.log("指定されたドキュメントが存在しません。");
        }
    } catch (error) {
        console.error("カウントの更新中にエラーが発生しました:", error);
    }
};

export { stampClick }; 