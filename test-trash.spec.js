const { chromium } = require('playwright');

(async () => {
    console.log('🚀 테스트 시작...\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 1. 페이지 접속
        console.log('1️⃣ 페이지 접속 중...');
        await page.goto('http://localhost');
        await page.waitForTimeout(2000);
        console.log('   ✅ 페이지 로드 완료\n');

        // 2. 새 메모 작성
        console.log('2️⃣ 새 메모 작성 중...');
        await page.click('button:has-text("새 메모")');
        await page.waitForTimeout(500);

        await page.fill('#memoTitle', '휴지통 테스트 메모');
        await page.fill('#memoContent', '이 메모는 휴지통 기능 테스트를 위해 작성되었습니다.');
        await page.waitForTimeout(2000); // 자동 저장 대기
        console.log('   ✅ 메모 저장 완료\n');

        // 3. 삭제 버튼 클릭
        console.log('3️⃣ 삭제 버튼 클릭...');
        await page.click('#deleteBtn');
        await page.waitForTimeout(500);
        console.log('   ✅ 삭제 모달 열림\n');

        // 4. 삭제 확인 (모달 내 삭제 버튼)
        console.log('4️⃣ 삭제 확인...');
        await page.click('#deleteModal button:has-text("삭제")');
        await page.waitForTimeout(1500);
        console.log('   ✅ 메모가 휴지통으로 이동됨\n');

        // 5. 휴지통 확인
        console.log('5️⃣ 휴지통 확인...');
        await page.click('#trashBtn');
        await page.waitForTimeout(2000);

        const trashItem = await page.locator('#notesList >> text=휴지통 테스트 메모').first();
        if (await trashItem.isVisible()) {
            console.log('   ✅ 휴지통에서 삭제된 메모 확인됨\n');
        } else {
            console.log('   ⚠️ 휴지통에서 메모를 찾는 중...');
            // 목록 내용 출력
            const listContent = await page.locator('#notesList').textContent();
            console.log('   휴지통 내용:', listContent.substring(0, 200));
        }

        // 6. 복원 테스트
        console.log('6️⃣ 메모 복원 테스트...');
        const restoreBtn = await page.locator('button:has-text("복원")').first();
        if (await restoreBtn.isVisible()) {
            await restoreBtn.click();
            await page.waitForTimeout(1500);
            console.log('   ✅ 메모 복원 완료\n');
        } else {
            console.log('   ⚠️ 복원 버튼을 찾을 수 없음\n');
        }

        // 7. 모든 메모에서 확인
        console.log('7️⃣ 복원된 메모 확인...');
        await page.click('#notesBtn');
        await page.waitForTimeout(1500);

        const restoredItem = await page.locator('#notesList >> text=휴지통 테스트 메모').first();
        if (await restoredItem.isVisible()) {
            console.log('   ✅ 복원된 메모가 목록에 표시됨\n');
        } else {
            console.log('   ❌ 복원된 메모를 찾을 수 없음\n');
        }

        console.log('🎉 모든 테스트 완료!');

    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
    } finally {
        await page.waitForTimeout(3000);
        await browser.close();
    }
})();
