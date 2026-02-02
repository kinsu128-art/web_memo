const { chromium } = require('playwright');

(async () => {
    console.log('🚀 편집 기능 테스트 시작...\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 1. 페이지 접속
        console.log('1️⃣ 페이지 접속 중...');
        await page.goto('http://localhost');
        await page.waitForTimeout(2000);
        console.log('   ✅ 페이지 로드 완료\n');

        // 2. 새 메모 작성
        console.log('2️⃣ 새 메모 작성...');
        await page.click('button:has-text("새 메모")');
        await page.waitForTimeout(500);
        await page.fill('#memoTitle', '편집 기능 테스트');
        await page.click('#memoContent');
        await page.keyboard.type('테스트 텍스트입니다.');
        await page.waitForTimeout(1500);
        console.log('   ✅ 메모 생성 완료\n');

        // 3. 텍스트 선택 후 볼드 테스트
        console.log('3️⃣ 볼드 테스트...');
        await page.click('#memoContent');
        await page.keyboard.press('Control+a');
        await page.click('button[title="굵게 (Ctrl+B)"]');
        await page.waitForTimeout(500);
        let html = await page.$eval('#memoContent', el => el.innerHTML);
        const hasBold = html.includes('<b>') || html.includes('<strong>') || html.includes('font-weight');
        console.log(`   볼드 적용: ${hasBold ? '✅ 성공' : '❌ 실패'}`);
        console.log(`   HTML: ${html.substring(0, 100)}\n`);

        // 4. 새 텍스트로 이탤릭 테스트
        console.log('4️⃣ 이탤릭 테스트...');
        await page.click('#memoContent');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await page.keyboard.type('이탤릭 테스트');
        await page.keyboard.press('Control+a');
        await page.click('button[title="이탤릭 (Ctrl+I)"]');
        await page.waitForTimeout(500);
        html = await page.$eval('#memoContent', el => el.innerHTML);
        const hasItalic = html.includes('<i>') || html.includes('<em>') || html.includes('font-style');
        console.log(`   이탤릭 적용: ${hasItalic ? '✅ 성공' : '❌ 실패'}`);
        console.log(`   HTML: ${html.substring(0, 100)}\n`);

        // 5. 밑줄 테스트
        console.log('5️⃣ 밑줄 테스트...');
        await page.click('#memoContent');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await page.keyboard.type('밑줄 테스트');
        await page.keyboard.press('Control+a');
        await page.click('button[title="밑줄 (Ctrl+U)"]');
        await page.waitForTimeout(500);
        html = await page.$eval('#memoContent', el => el.innerHTML);
        const hasUnderline = html.includes('<u>') || html.includes('text-decoration');
        console.log(`   밑줄 적용: ${hasUnderline ? '✅ 성공' : '❌ 실패'}`);
        console.log(`   HTML: ${html.substring(0, 100)}\n`);

        // 6. 취소선 테스트
        console.log('6️⃣ 취소선 테스트...');
        await page.click('#memoContent');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await page.keyboard.type('취소선 테스트');
        await page.keyboard.press('Control+a');
        await page.click('button[title="취소줄"]');
        await page.waitForTimeout(500);
        html = await page.$eval('#memoContent', el => el.innerHTML);
        const hasStrike = html.includes('<strike>') || html.includes('<s>') || html.includes('line-through');
        console.log(`   취소선 적용: ${hasStrike ? '✅ 성공' : '❌ 실패'}`);
        console.log(`   HTML: ${html.substring(0, 100)}\n`);

        // 7. 목록 테스트
        console.log('7️⃣ 목록 테스트...');
        await page.click('#memoContent');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await page.keyboard.type('항목1');
        await page.keyboard.press('Control+a');
        await page.click('button[title="목록"]');
        await page.waitForTimeout(500);
        html = await page.$eval('#memoContent', el => el.innerHTML);
        const hasList = html.includes('<ul>') || html.includes('<li>');
        console.log(`   목록 적용: ${hasList ? '✅ 성공' : '❌ 실패'}`);
        console.log(`   HTML: ${html.substring(0, 150)}\n`);

        // 8. 코드 블록 테스트
        console.log('8️⃣ 코드 블록 테스트...');
        await page.click('#memoContent');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await page.keyboard.type('console.log("hello")');
        await page.keyboard.press('Control+a');
        await page.click('button[title="코드 블록"]');
        await page.waitForTimeout(500);
        html = await page.$eval('#memoContent', el => el.innerHTML);
        const hasCode = html.includes('<pre') || html.includes('<code');
        console.log(`   코드블록 적용: ${hasCode ? '✅ 성공' : '❌ 실패'}`);
        console.log(`   HTML: ${html.substring(0, 150)}\n`);

        // 9. 인용구 테스트
        console.log('9️⃣ 인용구 테스트...');
        await page.click('#memoContent');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await page.keyboard.type('인용문입니다');
        await page.keyboard.press('Control+a');
        await page.click('button[title="인용구"]');
        await page.waitForTimeout(500);
        html = await page.$eval('#memoContent', el => el.innerHTML);
        const hasQuote = html.includes('<blockquote');
        console.log(`   인용구 적용: ${hasQuote ? '✅ 성공' : '❌ 실패'}`);
        console.log(`   HTML: ${html.substring(0, 150)}\n`);

        // 10. 색상 테스트
        console.log('🔟 색상 테스트...');
        await page.click('#memoContent');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await page.keyboard.type('색상 테스트');
        await page.keyboard.press('Control+a');
        await page.selectOption('#textColor', '#dc2626');
        await page.waitForTimeout(500);
        html = await page.$eval('#memoContent', el => el.innerHTML);
        const hasColor = html.includes('color') || html.includes('rgb');
        console.log(`   색상 적용: ${hasColor ? '✅ 성공' : '❌ 실패'}`);
        console.log(`   HTML: ${html.substring(0, 150)}\n`);

        console.log('🎉 편집 기능 테스트 완료!');

    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
    } finally {
        await page.waitForTimeout(3000);
        await browser.close();
    }
})();
