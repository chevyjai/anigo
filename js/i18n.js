// ============================================
// AniGO — Internationalization (i18n) Module
// Korean (ko) is DEFAULT. Chinese (zh) and English (en) supported.
// Updated for Champion system (15 spells, 5 champions)
// ============================================

const STRINGS = {
  // ════════════════════════════════════════════
  // KOREAN (한국어) — DEFAULT
  // ════════════════════════════════════════════
  ko: {
    // Title screen
    titleLogo: 'AniGO',
    titleSubtitle: '바둑 × 마법 주문',
    splashTagline: '직관이 알고리즘을 이기는 순간',
    puzzleMode: '퍼즐 모드',
    puzzleSub: '100+ 마법 바둑 퍼즐',
    playVsAI: 'AI 대전',
    aiSub: '챔피언을 선택하고 AI와 대결',
    local2P: '2인 대전',
    localSub: '친구와 함께 플레이',
    howToPlay: '플레이 방법',
    puzzleSelect: '퍼즐 선택',
    dailyQuests: '일일 퀘스트',
    yourRank: '등급',
    totalStars: '총 별',
    hintsRemaining: '힌트',
    puzzleGoal: '목표',
    movesUsed: '수',
    bestMoves: '최적',
    puzzleComplete: '퍼즐 완료!',
    nextLevel: '다음 레벨',
    retry: '다시 하기',
    undo: '되돌리기',
    hint: '힌트',
    reset: '초기화',

    // Champion select screen
    chooseYourChampion: '챔피언을 선택하세요',
    eachChampionHas: '각 챔피언은 고유한 패시브와 3개의 주문을 가지고 있어요',
    lockIn: '확정',
    selectAChampion: '챔피언을 선택하세요',
    lockInChampion: '확정: ',
    backToTitle: '← 돌아가기',
    confirmAndNext: '확인 & 다음 플레이어',
    passiveLabel: '패시브',
    blackChooseChampion: '흑: 챔피언을 선택하세요',
    whiteChooseChampion: '백: 챔피언을 선택하세요',
    difficultyEasy: '★☆☆ 쉬움',
    difficultyMedium: '★★☆ 보통',
    difficultyHard: '★★★ 어려움',

    // Archetype names
    archetypeControl: '컨트롤',
    archetypeAggro: '어그로',
    archetypeTrickster: '트릭스터',
    archetypeBoardModifier: '보드변형',
    archetypeChaos: '카오스',

    // Champion names
    champSeolhwa: '설화',
    champRyujin: '류진',
    champKumiho: '구미호',
    champMusubi: '무스비',
    champRaijin: '라이진',

    // Champion titles
    titleSeolhwa: '영토의 현자',
    titleRyujin: '화염의 전장',
    titleKumiho: '환영의 지배자',
    titleMusubi: '공허의 방랑자',
    titleRaijin: '뇌전의 소환사',

    // Champion pitches
    pitchSeolhwa: '무너지지 않는 성을 쌓아라.',
    pitchRyujin: '전장을 불바다로 만들어라.',
    pitchKumiho: '적이 현실을 의심하게 만들어라.',
    pitchMusubi: '바둑판 그 자체를 지배하라.',
    pitchRaijin: '번개를 타고 전장을 휩쓸어라.',

    // Passive names
    passivePermafrost: '영구동토',
    passiveDragonsHunger: '용의 굶주림',
    passiveFoxsCunning: '여우의 꾀',
    passiveSpatialAnomaly: '공간 이상',
    passiveEyeOfStorm: '폭풍의 눈',

    // Passive descriptions
    passivePermafrostDesc: '화점 위의 돌은 활로 +1 — 얼음이 지켜준다.',
    passiveDragonsHungerDesc: '따냄 시 기 +2 추가 — 용은 배고프다.',
    passiveFoxsCunningDesc: '패스 시 유령 돌 무료 배치 (1회) — 속임수의 달인.',
    passiveSpatialAnomalyDesc: '게임 시작 시 무작위 공허 1개 — 차원이 뒤틀린다.',
    passiveEyeOfStormDesc: '최대 기 도달 시 다음 주문 비용 -2 — 폭풍의 중심.',

    // Game HUD
    yourTurn: '내 차례!',
    opponentTurn: '상대 차례',
    aiThinking: 'AI 생각 중...',
    placeStone: '돌 놓기',
    turnN: '턴',
    yourSpells: '주문',
    stats: '전적',
    captures: '따냄',
    opponent: '상대',
    chi: '기',
    logLabel: '기록',
    gameStarted: '게임 시작!',
    blackTurn: '흑의 차례',
    whiteTurn: '백의 차례',

    // Pass button
    pass: '패스',
    passHint: '+2 기',

    // Action prompt
    actionPromptPlace: '바둑판을 클릭해 돌을 놓으세요!',
    actionPromptTarget: '${name}의 대상을 클릭하세요!',

    // Phase label
    phaseTarget: '대상 선택: ${name}',

    // Spell names (all 15)
    spellStoneSkin: '석갑',
    spellSanctuary: '성역',
    spellEarthenWall: '토벽',
    spellShatter: '파쇄',
    spellSmolder: '잔불',
    spellInferno: '지옥불',
    spellMirage: '신기루',
    spellSnare: '올가미',
    spellNineLives: '구사일생',
    spellVoidRift: '공허의 균열',
    spellWarpGate: '차원문',
    spellPhaseShift: '위상변환',
    spellChainLightning: '연쇄번개',
    spellWildfire: '들불',
    spellThunderVeil: '뇌운장막',

    // Spell descriptions (long)
    spellDescStoneSkin: '5턴 동안 돌을 따낼 수 없게 만듭니다. 비밀.',
    spellDescSanctuary: '3x3 영역을 4턴 동안 따냄으로부터 보호합니다.',
    spellDescEarthenWall: '연속 3개의 교차점을 영구적으로 막습니다. 집 경계로 작용합니다.',
    spellDescShatter: '활로가 1개인 적 돌 하나를 파괴합니다. 기를 얻습니다.',
    spellDescSmolder: '3턴 동안 매 턴 활로를 1개씩 줄이는 숨겨진 효과를 부착합니다.',
    spellDescInferno: '범위 2 이내의 단수 상태인 모든 적 돌을 즉시 따냅니다.',
    spellDescMirage: '유령 돌을 놓습니다. 상대에게 진짜처럼 보입니다. 접촉 시 사라집니다.',
    spellDescSnare: '숨겨진 함정. 밟은 적은 다음 턴을 잃습니다.',
    spellDescNineLives: '이번 턴에 잡힌 그룹을 부활시킵니다. 적 돌을 밀어냅니다.',
    spellDescVoidRift: '교차점 하나를 영구적으로 제거합니다. 돌을 파괴할 수 있습니다. 연쇄 가능.',
    spellDescWarpGate: '두 지점을 인접하게 연결합니다. 그룹이 판을 가로질러 연결됩니다.',
    spellDescPhaseShift: '3턴 동안 돌이 적을 무시합니다. 1턴 동안 숨겨집니다.',
    spellDescChainLightning: '75%/50%/25% 확률로 연쇄적으로 적 돌을 파괴합니다.',
    spellDescWildfire: '2칸 이내의 모든 돌이 50% 확률로 파괴됩니다. 아군도 포함!',
    spellDescThunderVeil: '3턴 동안 내 돌이 상대에게 보이지 않습니다. 전장의 안개!',

    // Spell descriptions (short)
    spellDescShortStoneSkin: '돌에 갑옷을 입힌다. 비밀.',
    spellDescShortSanctuary: '3x3 보호 결계, 4턴 지속.',
    spellDescShortEarthenWall: '3칸 돌벽을 세운다.',
    spellDescShortShatter: '위험에 빠진 적 돌을 박살낸다.',
    spellDescShortSmolder: '숨겨진 카운트다운. 활로가 타들어간다.',
    spellDescShortInferno: '근처 단수 돌을 모조리 태운다.',
    spellDescShortMirage: '가짜 돌을 심는다. 비밀.',
    spellDescShortSnare: '숨겨진 함정. 턴을 빼앗는다.',
    spellDescShortNineLives: '잡힌 그룹이 부활한다.',
    spellDescShortVoidRift: '교차점을 소멸시킨다.',
    spellDescShortWarpGate: '먼 두 지점을 이어 붙인다.',
    spellDescShortPhaseShift: '돌이 무형이 된다.',
    spellDescShortChainLightning: '연쇄 확률 낙뢰.',
    spellDescShortWildfire: '근처 모든 돌 50/50 폭파.',
    spellDescShortThunderVeil: '3턴간 모든 돌을 숨긴다.',

    // Spell categories
    catAttack: '공격',
    catDefense: '방어',
    catTrick: '속임수',
    catTerrain: '지형',
    catTrap: '함정',
    catSecret: '비밀',
    catRisky: '위험',

    // Color names
    black: '흑',
    white: '백',

    // Scoring screen
    wins: '승리!',
    stones: '돌',
    territory: '집',
    komi: '덤',
    total: '합계',
    playAgain: '다시 하기',

    // Post-game learning card
    whatYouLearned: '이번 게임에서 배운 것',
    youPlacedStones: '돌 <strong>${stones}</strong>개를 놓고, <strong>${captures}</strong>개를 따내고, 주문 <strong>${spells}</strong>개를 사용했어요.',
    tipForNextGame: '다음 게임 팁:',
    tipUseSpells: '다음에는 주문을 사용해 보세요 -- 판세를 뒤집을 수 있어요!',
    tipKeepPlaying: '다른 챔피언도 시도해 보세요!',

    // Intro slideshow
    introSlide1Title: '바둑 + 마법',
    introSlide1Body: '<strong>AniGO</strong>는 마법 주문이 있는 바둑이에요! 영역을 둘러싸고 돌을 따내 승리하세요.',
    introSlide2Title: '따내기',
    introSlide2Body: '적 돌을 4방향으로 둘러싸면 <strong>따냅니다</strong>. 따낼 때마다 기를 얻어요.',
    introSlide3Title: '챔피언',
    introSlide3Body: '각 챔피언은 <strong>패시브 능력</strong>과 <strong>3개의 고유 주문</strong>이 있어요. 주문 카드를 클릭해 시전하세요!',
    introGotIt: '알겠어요!',
    introSkip: '인트로 건너뛰기',

    // Contextual hints/toasts
    hintFirstMove: '교차점을 클릭해 첫 번째 돌을 놓으세요!',
    hintFirstCapture: '멋진 따냄! +1 기를 얻었어요.',
    hintCastSpell: '주문을 시전할 기가 충분해요! 주문 카드를 클릭해 보세요.',

    // Spell hand empty states
    aiIsThinking: 'AI가 생각 중...',
    noChampion: '챔피언 없음',

    // How to Play modal
    helpTitle: 'AniGO 플레이 방법',
    helpQuickStartTitle: '빠른 시작',
    helpQuickStartText: '<strong>AniGO</strong>는 마법 챔피언이 있는 바둑! 챔피언을 선택하고, 돌을 놓고, 주문을 시전하고, 판을 지배하세요.',
    helpBasicsTitle: '기본 규칙',
    helpBoardTitle: '바둑판',
    helpBoardText: '<strong>9x9 바둑판</strong>에서 플레이합니다. 선이 만나는 곳에 돌을 놓으세요.',
    helpTurnsTitle: '차례',
    helpTurnsText: '<strong>흑이 먼저 둡니다.</strong> 번갈아 돌을 하나씩 놓습니다. <strong>패스</strong>해서 턴을 넘기고 +2 기를 얻을 수 있어요.',
    helpCaptureTitle: '돌 따내기',
    helpCaptureText1: '모든 돌은 옆에 <strong>빈 공간</strong>(위, 아래, 좌, 우)이 있어야 살아남아요. 이 빈 공간을 "활로"라고 해요.',
    helpCaptureText2: '<strong>적 돌을 둘러싸서</strong> 활로가 0이 되면 따냅니다! 돌이 제거되고 +1 기를 얻어요.',
    helpWinTitle: '이기는 방법',
    helpWinText: '양쪽이 연속으로 패스하면 게임이 끝나요. <strong>내 돌 + 내가 둘러싼 빈 공간 = 내 점수.</strong> 백은 +5.5 덤을 받아요.',
    helpChampionsTitle: '챔피언',
    helpChampionsText: '게임 전에 챔피언을 선택합니다. 각 챔피언은 <strong>패시브 능력</strong>과 <strong>3개의 고유 주문</strong>이 있어요.',
    helpChiTitle: '기 = 마법 에너지',
    helpChiText: '주문을 시전하려면 기를 사용합니다.',
    helpChiStart: '<strong>시작:</strong> 3 기',
    helpChiPerTurn: '<strong>매 턴:</strong> +1 기',
    helpChiCapture: '<strong>돌 따냄:</strong> +1 기',
    helpChiPass: '<strong>패스:</strong> +2 기',
    helpChiMax: '<strong>최대:</strong> 10 기',
    helpUsingTitle: '주문 사용',
    helpUsingText: '내 차례에 다음 중 하나를 할 수 있어요:',
    helpUsingPlace: '<strong>돌 놓기</strong> (일반 행동)',
    helpUsingCast: '<strong>주문 시전</strong> (카드 클릭, 바둑판 클릭)',
    helpUsingCombo: '<strong>돌 + 주문 동시에</strong> (추가 기 +1 소모)',
    helpUsingPass: '<strong>패스</strong> (턴 넘기기, +2 기 획득)',

    helpTipsTitle: '초보자를 위한 팁',
    helpTip1: '<strong>귀에서 시작하세요!</strong> 영역을 확보하기 가장 쉬운 곳이에요.',
    helpTip2: '<strong>돌을 연결하세요.</strong> 연결된 그룹은 따내기 어려워요.',
    helpTip3: '<strong>기를 아끼세요.</strong> 초반에 다 쓰지 마세요 -- 긴급 상황을 대비하세요!',

    helpControlsTitle: '조작법',
    helpControlPlace: '돌 놓기',
    helpControlPlaceDesc: '선이 만나는 곳 클릭',
    helpControlCast: '주문 시전',
    helpControlCastDesc: '주문 카드 클릭, 바둑판 클릭',
    helpControlCancel: '주문 취소',
    helpControlCancelDesc: '우클릭 또는 Esc 키',
    helpControlPass: '턴 넘기기',
    helpControlPassDesc: '"패스" 버튼 클릭',
    helpControlEnd: '게임 종료',
    helpControlEndDesc: '양쪽 연속 패스',

    helpGlossaryTitle: '용어 안내',
    glossaryLiberty: '활로',
    glossaryLibertyDesc: '돌 옆의 빈 공간 (위/아래/좌/우)',
    glossaryAtari: '단수',
    glossaryAtariDesc: '활로 1개만 남은 돌 -- 곧 잡힐 수 있어요!',
    glossaryCapture: '따냄',
    glossaryCaptureDesc: '돌을 완전히 둘러싸면 제거돼요',
    glossaryKo: '패',
    glossaryKoDesc: '방금 잡은 돌을 바로 되잡을 수 없어요 (무한 반복 방지!)',
    glossaryTerritory: '집',
    glossaryTerritoryDesc: '내 돌로 둘러싼 빈 공간 = 내 점수',
    glossaryKomi: '덤',
    glossaryKomiDesc: '백이 후수 보상으로 받는 5.5 보너스 점수',
    glossaryChi: '기',
    glossaryChiDesc: '주문 시전을 위한 마법 에너지',
    glossaryCombo: '콤보 수',
    glossaryComboDesc: '한 턴에 돌 놓기 + 주문 시전 (추가 기 +1 소모)',

    // Web3 / NFT teaser strings
    web3SectionTitle: 'WEB3',
    web3ComingSoon: 'COMING SOON',
    web3NftSkins: 'NFT 주문 스킨',
    web3NftSkinsDesc: '한정판 주문 이펙트를 소유하세요',
    web3TokenWager: '토큰 베팅 대전',
    web3TokenWagerDesc: '실력으로 증명하고, 토큰으로 보상받으세요',
    web3Wallet: '지갑 연결',
    web3WalletDesc: '프리미엄 보상을 잠금 해제하세요',
    privyLogin: '지갑으로 로그인',
    privyLoginSub: 'Web3 프리미엄 기능 해금',

    // Social / Challenge strings
    challengeFriend: '친구 도전',
    challengeFriendSub: '카톡으로 도전장을 보내세요',
    shareKakao: '카카오톡 공유',
    shareTwitter: '트위터 공유',
    shareCopied: '복사 완료!',
    inviteFriend: '친구 초대',
    inviteFriendDesc: '함께 플레이하면 더 재밌어요',

    // Language selector
    langKR: 'KR',
    langCN: 'CN',
    langEN: 'EN',
  },

  // ════════════════════════════════════════════
  // CHINESE SIMPLIFIED (简体中文)
  // ════════════════════════════════════════════
  zh: {
    // Title screen
    titleLogo: 'AniGO',
    titleSubtitle: '围棋 + 魔法',
    splashTagline: '当直觉对抗算法，胜负未定。',
    puzzleMode: '谜题模式',
    puzzleSub: '100+ 魔法围棋谜题',
    playVsAI: 'AI 对战',
    aiSub: '选择英雄，挑战AI',
    local2P: '双人对战',
    localSub: '和朋友一起玩',
    howToPlay: '游戏说明',
    puzzleSelect: '选择谜题',
    dailyQuests: '每日任务',
    yourRank: '等级',
    totalStars: '总星数',
    hintsRemaining: '提示',
    puzzleGoal: '目标',
    movesUsed: '步数',
    bestMoves: '最优',
    puzzleComplete: '谜题完成！',
    nextLevel: '下一关',
    retry: '重试',
    undo: '撤销',
    hint: '提示',
    reset: '重置',

    // Champion select screen
    chooseYourChampion: '选择你的冠军',
    eachChampionHas: '每个冠军拥有独特的被动技能和3个法术',
    lockIn: '锁定',
    selectAChampion: '请选择冠军',
    lockInChampion: '锁定: ',
    backToTitle: '← 返回',
    confirmAndNext: '确认 & 下一位',
    passiveLabel: '被动',
    blackChooseChampion: '黑方：选择冠军',
    whiteChooseChampion: '白方：选择冠军',
    difficultyEasy: '★☆☆ 简单',
    difficultyMedium: '★★☆ 中等',
    difficultyHard: '★★★ 困难',

    // Archetype names
    archetypeControl: '控制',
    archetypeAggro: '进攻',
    archetypeTrickster: '诡术',
    archetypeBoardModifier: '棋盘改造',
    archetypeChaos: '混沌',

    // Champion names
    champSeolhwa: '雪花',
    champRyujin: '龙神',
    champKumiho: '九尾狐',
    champMusubi: '结',
    champRaijin: '雷神',

    // Champion titles
    titleSeolhwa: '领地贤者',
    titleRyujin: '烈焰战神',
    titleKumiho: '暗影骗师',
    titleMusubi: '虚空行者',
    titleRaijin: '风暴召唤师',

    // Champion pitches
    pitchSeolhwa: '建造坚不可摧的堡垒。',
    pitchRyujin: '烧光一切。',
    pitchKumiho: '让他们怀疑现实。',
    pitchMusubi: '重塑棋盘本身。',
    pitchRaijin: '驾驭闪电。',

    // Passive names
    passivePermafrost: '永冻',
    passiveDragonsHunger: '龙之饥渴',
    passiveFoxsCunning: '狐之狡诈',
    passiveSpatialAnomaly: '空间异常',
    passiveEyeOfStorm: '风暴之眼',

    // Passive descriptions
    passivePermafrostDesc: '星位上的棋子气+1。',
    passiveDragonsHungerDesc: '提子时额外获得+2气。',
    passiveFoxsCunningDesc: '跳过时放置免费幻影棋子(1次)。',
    passiveSpatialAnomalyDesc: '游戏开始时有1个随机虚空点。',
    passiveEyeOfStormDesc: '满气时下一个法术减少2费。',

    // Game HUD
    yourTurn: '你的回合',
    opponentTurn: '对手回合',
    aiThinking: 'AI思考中...',
    placeStone: '落子',
    turnN: '回合',
    yourSpells: '法术',
    stats: '数据',
    captures: '提子',
    opponent: '对手',
    chi: '气',
    logLabel: '日志',
    gameStarted: '游戏开始！',
    blackTurn: '黑方回合',
    whiteTurn: '白方回合',

    // Pass button
    pass: '跳过',
    passHint: '+2气',

    // Action prompt
    actionPromptPlace: '点击棋盘落子！',
    actionPromptTarget: '点击${name}的目标！',

    // Phase label
    phaseTarget: '选择目标：${name}',

    // Spell names (all 15)
    spellStoneSkin: '石肤',
    spellSanctuary: '庇护所',
    spellEarthenWall: '土墙',
    spellShatter: '破碎',
    spellSmolder: '阴燃',
    spellInferno: '炼狱',
    spellMirage: '幻影',
    spellSnare: '陷阱',
    spellNineLives: '九死一生',
    spellVoidRift: '虚空裂隙',
    spellWarpGate: '传送门',
    spellPhaseShift: '相位转换',
    spellChainLightning: '连锁闪电',
    spellWildfire: '野火',
    spellThunderVeil: '雷幕',

    // Spell descriptions (long)
    spellDescStoneSkin: '5回合内你的棋子不可被提。隐藏。',
    spellDescSanctuary: '保护3x3区域4回合内不被提子。',
    spellDescEarthenWall: '永久封锁连续3个交叉点。作为地盘边界。',
    spellDescShatter: '摧毁一颗只剩1口气的敌方棋子。获得气。',
    spellDescSmolder: '附加隐藏效果，3回合内每回合减少1口气。',
    spellDescInferno: '范围2内所有处于打吃状态的敌方棋子立即被提。',
    spellDescMirage: '放置一颗幻影棋子。对手看起来像真的。触碰即消失。',
    spellDescSnare: '隐藏陷阱。踩中的敌人失去下一回合。',
    spellDescNineLives: '复活本回合被提的棋组。挤走敌方棋子。',
    spellDescVoidRift: '永久移除一个交叉点。可摧毁棋子。可能连锁。',
    spellDescWarpGate: '两个点变为相邻。棋组跨越棋盘相连。',
    spellDescPhaseShift: '你的棋子3回合内忽略敌方。1回合内隐藏。',
    spellDescChainLightning: '75%/50%/25%概率连锁摧毁敌方棋子。',
    spellDescWildfire: '2格内所有棋子50%概率被摧毁。己方也受影响！',
    spellDescThunderVeil: '你的棋子3回合内对手不可见。战争迷雾！',

    // Spell descriptions (short)
    spellDescShortStoneSkin: '保护一颗棋子。秘密。',
    spellDescShortSanctuary: '3x3禁提区域，4回合。',
    spellDescShortEarthenWall: '建造3格墙壁。',
    spellDescShortShatter: '摧毁危险的敌方棋子。',
    spellDescShortSmolder: '隐藏倒计时。烧毁气。',
    spellDescShortInferno: '提掉附近所有打吃棋子。',
    spellDescShortMirage: '放置假棋子。秘密。',
    spellDescShortSnare: '隐藏陷阱。偷取回合。',
    spellDescShortNineLives: '复活被提棋组。',
    spellDescShortVoidRift: '删除一个交叉点。',
    spellDescShortWarpGate: '连接两个远距离点。',
    spellDescShortPhaseShift: '棋子变为无形。',
    spellDescShortChainLightning: '连锁概率打击。',
    spellDescShortWildfire: '附近所有棋子50/50摧毁。',
    spellDescShortThunderVeil: '3回合内隐藏所有棋子。',

    // Spell categories
    catAttack: '攻击',
    catDefense: '防御',
    catTrick: '诡计',
    catTerrain: '地形',
    catTrap: '陷阱',
    catSecret: '秘密',
    catRisky: '高风险',

    // Color names
    black: '黑方',
    white: '白方',

    // Scoring screen
    wins: '获胜！',
    stones: '棋子',
    territory: '地盘',
    komi: '贴目',
    total: '总计',
    playAgain: '再来一局',

    // Post-game learning card
    whatYouLearned: '本局学到了什么',
    youPlacedStones: '你落了<strong>${stones}</strong>颗棋子，提了<strong>${captures}</strong>颗，使用了<strong>${spells}</strong>个法术。',
    tipForNextGame: '下局建议：',
    tipUseSpells: '下次试试使用你的法术——它们能扭转局势！',
    tipKeepPlaying: '试试不同的冠军吧！',

    // Intro slideshow
    introSlide1Title: '围棋 + 魔法',
    introSlide1Body: '<strong>AniGO</strong>是带魔法的围棋！围住领地，提掉棋子来获胜。',
    introSlide2Title: '提子',
    introSlide2Body: '在四个方向围住敌方棋子就能<strong>提掉</strong>它。每次提子获得气。',
    introSlide3Title: '冠军',
    introSlide3Body: '每个冠军有<strong>被动技能</strong>和<strong>3个独特法术</strong>。点击法术牌来施放！',
    introGotIt: '明白了！',
    introSkip: '跳过介绍',

    // Contextual hints/toasts
    hintFirstMove: '点击任意交叉点放下第一颗棋子！',
    hintFirstCapture: '漂亮的提子！你获得了+1气。',
    hintCastSpell: '你有足够的气施放法术了！试着点击一张法术牌。',

    // Spell hand empty states
    aiIsThinking: 'AI思考中...',
    noChampion: '没有冠军',

    // How to Play modal
    helpTitle: 'AniGO 游戏说明',
    helpQuickStartTitle: '快速入门',
    helpQuickStartText: '<strong>AniGO</strong>是带魔法冠军的围棋！选择冠军，落子，施放法术，控制棋盘。',
    helpBasicsTitle: '基础规则',
    helpBoardTitle: '棋盘',
    helpBoardText: '在<strong>9x9棋盘</strong>上对弈。把棋子放在线的交叉点。',
    helpTurnsTitle: '轮流',
    helpTurnsText: '<strong>黑方先行。</strong>轮流各下一颗棋子。也可以<strong>跳过</strong>回合获得+2气。',
    helpCaptureTitle: '提子',
    helpCaptureText1: '每颗棋子旁边需要<strong>空位</strong>（上下左右）才能存活。这些空位叫做"气"。',
    helpCaptureText2: '如果你<strong>围住敌方棋子</strong>使其气为零，就提掉它！棋子被移除，你获得+1气。',
    helpWinTitle: '如何获胜',
    helpWinText: '双方连续跳过时游戏结束。<strong>你的棋子 + 你围住的空地 = 你的分数。</strong>白方获得+5.5贴目。',
    helpChampionsTitle: '冠军',
    helpChampionsText: '游戏前选择一位冠军。每位冠军有<strong>被动技能</strong>和<strong>3个独特法术</strong>。',
    helpChiTitle: '气 = 魔法能量',
    helpChiText: '施放法术需要消耗气。',
    helpChiStart: '<strong>初始：</strong>3气',
    helpChiPerTurn: '<strong>每回合：</strong>+1气',
    helpChiCapture: '<strong>提子：</strong>+1气',
    helpChiPass: '<strong>跳过：</strong>+2气',
    helpChiMax: '<strong>上限：</strong>10气',
    helpUsingTitle: '使用法术',
    helpUsingText: '你的回合可以做以下之一：',
    helpUsingPlace: '<strong>落子</strong>（普通行动）',
    helpUsingCast: '<strong>施放法术</strong>（点击法术牌，再点击棋盘）',
    helpUsingCombo: '<strong>落子 + 法术同时</strong>（额外消耗+1气）',
    helpUsingPass: '<strong>跳过</strong>（跳过回合，+2气）',

    helpTipsTitle: '新手建议',
    helpTip1: '<strong>从角落开始！</strong>最容易占领地盘的地方。',
    helpTip2: '<strong>保持棋子相连。</strong>连接的棋组更难被提。',
    helpTip3: '<strong>节省气。</strong>别太早用完——留着应急！',

    helpControlsTitle: '操作',
    helpControlPlace: '落子',
    helpControlPlaceDesc: '点击线的交叉点',
    helpControlCast: '施放法术',
    helpControlCastDesc: '点击法术牌，再点击棋盘',
    helpControlCancel: '取消法术',
    helpControlCancelDesc: '右键或按Esc',
    helpControlPass: '跳过回合',
    helpControlPassDesc: '点击"跳过"按钮',
    helpControlEnd: '结束游戏',
    helpControlEndDesc: '双方连续跳过',

    helpGlossaryTitle: '术语表',
    glossaryLiberty: '气',
    glossaryLibertyDesc: '棋子旁边的空位（上/下/左/右）',
    glossaryAtari: '打吃',
    glossaryAtariDesc: '只剩1口气的棋子——即将被提！',
    glossaryCapture: '提子',
    glossaryCaptureDesc: '完全围住棋子后被移除',
    glossaryKo: '劫',
    glossaryKoDesc: '不能立即取回刚被提的棋子（防止无限循环！）',
    glossaryTerritory: '地盘',
    glossaryTerritoryDesc: '你的棋子围住的空地 = 你的分数',
    glossaryKomi: '贴目',
    glossaryKomiDesc: '白方后手获得的5.5补偿分',
    glossaryChi: '气（能量）',
    glossaryChiDesc: '施放法术的魔法能量',
    glossaryCombo: '组合招',
    glossaryComboDesc: '一回合内落子 + 施放法术（额外+1气消耗）',

    // Web3 / NFT teaser strings
    web3SectionTitle: 'WEB3',
    web3ComingSoon: '即将推出',
    web3NftSkins: 'NFT法术皮肤',
    web3NftSkinsDesc: '拥有限量版法术特效',
    web3TokenWager: '代币对战',
    web3TokenWagerDesc: '用实力证明自己，赢取奖励',
    web3Wallet: '连接钱包',
    web3WalletDesc: '解锁高级奖励',
    privyLogin: '钱包登录',
    privyLoginSub: '解锁Web3高级功能',

    // Social / Challenge strings
    challengeFriend: '挑战好友',
    challengeFriendSub: '通过消息发送挑战',
    shareKakao: '分享到KakaoTalk',
    shareTwitter: '分享到Twitter',
    shareCopied: '已复制！',
    inviteFriend: '邀请好友',
    inviteFriendDesc: '和朋友一起更有趣',

    // Language selector
    langKR: 'KR',
    langCN: 'CN',
    langEN: 'EN',
  },

  // ════════════════════════════════════════════
  // ENGLISH
  // ════════════════════════════════════════════
  en: {
    // Title screen
    titleLogo: 'AniGO',
    titleSubtitle: 'GO + MAGIC SPELLS',
    splashTagline: 'Where human intuition fights back.',
    puzzleMode: 'PUZZLE MODE',
    puzzleSub: '100+ Magic Go Puzzles',
    playVsAI: 'VS AI',
    aiSub: 'Pick a champion and battle AI',
    local2P: '2 PLAYER',
    localSub: 'Play with a friend',
    howToPlay: 'How to Play',
    puzzleSelect: 'Select Puzzle',
    dailyQuests: 'Daily Quests',
    yourRank: 'Rank',
    totalStars: 'Total Stars',
    hintsRemaining: 'Hints',
    puzzleGoal: 'Goal',
    movesUsed: 'Moves',
    bestMoves: 'Optimal',
    puzzleComplete: 'Puzzle Complete!',
    nextLevel: 'Next Level',
    retry: 'Retry',
    undo: 'Undo',
    hint: 'Hint',
    reset: 'Reset',

    // Champion select screen
    chooseYourChampion: 'Choose Your Champion',
    eachChampionHas: 'Each champion has a unique passive and 3 spells',
    lockIn: 'Lock In',
    selectAChampion: 'Select a Champion',
    lockInChampion: 'Lock In ',
    backToTitle: '← Back',
    confirmAndNext: 'Confirm & Next Player',
    passiveLabel: 'PASSIVE',
    blackChooseChampion: 'Black: Choose Your Champion',
    whiteChooseChampion: 'White: Choose Your Champion',
    difficultyEasy: '★☆☆ Easy',
    difficultyMedium: '★★☆ Medium',
    difficultyHard: '★★★ Hard',

    // Archetype names
    archetypeControl: 'Control',
    archetypeAggro: 'Aggro',
    archetypeTrickster: 'Trickster',
    archetypeBoardModifier: 'Board Modifier',
    archetypeChaos: 'Chaos',

    // Champion names
    champSeolhwa: 'Seolhwa',
    champRyujin: 'Ryujin',
    champKumiho: 'Kumiho',
    champMusubi: 'Musubi',
    champRaijin: 'Raijin',

    // Champion titles
    titleSeolhwa: 'The Territorial Sage',
    titleRyujin: 'The Flame Warlord',
    titleKumiho: 'The Shadow Trickster',
    titleMusubi: 'The Void Walker',
    titleRaijin: 'The Storm Caller',

    // Champion pitches
    pitchSeolhwa: 'Build an unbreakable fortress.',
    pitchRyujin: 'Burn everything down.',
    pitchKumiho: 'Make them question reality.',
    pitchMusubi: 'Reshape the board itself.',
    pitchRaijin: 'Ride the lightning.',

    // Passive names
    passivePermafrost: 'Permafrost',
    passiveDragonsHunger: "Dragon's Hunger",
    passiveFoxsCunning: "Fox's Cunning",
    passiveSpatialAnomaly: 'Spatial Anomaly',
    passiveEyeOfStorm: 'Eye of the Storm',

    // Passive descriptions
    passivePermafrostDesc: 'Stones on star points get +1 liberty.',
    passiveDragonsHungerDesc: '+2 Chi per capture event.',
    passiveFoxsCunningDesc: 'Passing also places a free phantom (1/game).',
    passiveSpatialAnomalyDesc: 'Game starts with 1 random void point.',
    passiveEyeOfStormDesc: 'At max Chi, next spell costs 2 less.',

    // Game HUD
    yourTurn: 'YOUR TURN',
    opponentTurn: 'OPPONENT',
    aiThinking: 'AI THINKING...',
    placeStone: 'PLACE STONE',
    turnN: 'Turn',
    yourSpells: 'SPELLS',
    stats: 'STATS',
    captures: 'Captures',
    opponent: 'OPPONENT',
    chi: 'Chi',
    logLabel: 'LOG',
    gameStarted: 'Game started!',
    blackTurn: "BLACK'S TURN",
    whiteTurn: "WHITE'S TURN",

    // Pass button
    pass: 'PASS',
    passHint: '+2 Chi',

    // Action prompt
    actionPromptPlace: 'Click the board to place a stone!',
    actionPromptTarget: 'Click a target for ${name}!',

    // Phase label
    phaseTarget: 'TARGET: ${name}',

    // Spell names (all 15)
    spellStoneSkin: 'Stone Skin',
    spellSanctuary: 'Sanctuary',
    spellEarthenWall: 'Earthen Wall',
    spellShatter: 'Shatter',
    spellSmolder: 'Smolder',
    spellInferno: 'Inferno',
    spellMirage: 'Mirage',
    spellSnare: 'Snare',
    spellNineLives: 'Nine Lives',
    spellVoidRift: 'Void Rift',
    spellWarpGate: 'Warp Gate',
    spellPhaseShift: 'Phase Shift',
    spellChainLightning: 'Chain Lightning',
    spellWildfire: 'Wildfire',
    spellThunderVeil: 'Thunder Veil',

    // Spell descriptions (long)
    spellDescStoneSkin: 'Make your stone uncapturable for 5 turns. Hidden.',
    spellDescSanctuary: 'Protect a 3x3 area from captures for 4 turns.',
    spellDescEarthenWall: 'Block 3 consecutive intersections permanently. Counts as territory border.',
    spellDescShatter: 'Destroy one enemy stone with only 1 liberty. Gain Chi.',
    spellDescSmolder: 'Attach a hidden effect that removes 1 liberty per turn for 3 turns.',
    spellDescInferno: 'All enemy stones in atari within range 2 are captured instantly.',
    spellDescMirage: 'Place a phantom stone. Looks real to opponent. Vanishes if touched.',
    spellDescSnare: 'Hidden trap. Enemy who steps on it loses their next turn.',
    spellDescNineLives: 'Bring back a group captured this turn. Displaces enemy stones.',
    spellDescVoidRift: 'Permanently remove a point. Can destroy stones. May cascade.',
    spellDescWarpGate: 'Two points become adjacent. Groups connect across the board.',
    spellDescPhaseShift: 'Your stone ignores enemies for 3 turns. Hidden for 1 turn.',
    spellDescChainLightning: '75%/50%/25% chance to destroy chain of enemy stones.',
    spellDescWildfire: 'Every stone within 2 spaces has 50% destroy chance. Hits your own too!',
    spellDescThunderVeil: 'Your stones become invisible to opponent for 3 turns. Fog of war!',

    // Spell descriptions (short)
    spellDescShortStoneSkin: 'Shield a stone. Secret.',
    spellDescShortSanctuary: '3x3 no-capture zone, 4 turns.',
    spellDescShortEarthenWall: 'Build a 3-point wall.',
    spellDescShortShatter: 'Destroy enemy stone in danger.',
    spellDescShortSmolder: 'Hidden countdown. Burns liberties.',
    spellDescShortInferno: 'Capture all atari stones nearby.',
    spellDescShortMirage: 'Place a fake stone. Secret.',
    spellDescShortSnare: 'Hidden trap. Steals a turn.',
    spellDescShortNineLives: 'Resurrect a captured group.',
    spellDescShortVoidRift: 'Delete a board intersection.',
    spellDescShortWarpGate: 'Link two distant points.',
    spellDescShortPhaseShift: 'Stone becomes intangible.',
    spellDescShortChainLightning: 'Cascading RNG strikes.',
    spellDescShortWildfire: '50/50 destroy all stones nearby.',
    spellDescShortThunderVeil: 'Hide all your stones for 3 turns.',

    // Spell categories
    catAttack: 'Attack',
    catDefense: 'Defense',
    catTrick: 'Trick',
    catTerrain: 'Terrain',
    catTrap: 'Trap',
    catSecret: 'Secret',
    catRisky: 'Risky',

    // Color names
    black: 'Black',
    white: 'White',

    // Scoring screen
    wins: 'Wins!',
    stones: 'stones',
    territory: 'territory',
    komi: 'komi',
    total: 'total',
    playAgain: 'Play Again',

    // Post-game learning card
    whatYouLearned: 'Game Summary',
    youPlacedStones: 'You placed <strong>${stones}</strong> stones, captured <strong>${captures}</strong>, and used <strong>${spells}</strong> spell${pluralSpells}.',
    tipForNextGame: 'Tip for next game:',
    tipUseSpells: 'Try using your spells next game -- they can turn the tide!',
    tipKeepPlaying: 'Keep exploring different champions!',

    // Intro slideshow
    introSlide1Title: 'Go + Magic',
    introSlide1Body: '<strong>AniGO</strong> is Go (Baduk) with magic spells! Surround territory and capture stones to win.',
    introSlide2Title: 'Capture',
    introSlide2Body: 'Surround an enemy stone on all 4 sides to <strong>capture</strong> it. Captures earn Chi energy.',
    introSlide3Title: 'Champions',
    introSlide3Body: 'Each champion has a <strong>passive ability</strong> and <strong>3 unique spells</strong>. Click a spell card to cast it!',
    introGotIt: 'Got It',
    introSkip: 'Skip Intro',

    // Contextual hints/toasts
    hintFirstMove: 'Click the board to place your first stone!',
    hintFirstCapture: 'Nice capture! You earned +1 Chi.',
    hintCastSpell: 'You have enough Chi to cast a spell! Click a spell card.',

    // Spell hand empty states
    aiIsThinking: 'AI is thinking...',
    noChampion: 'No champion',

    // How to Play modal
    helpTitle: 'How to Play AniGO',
    helpQuickStartTitle: 'Quick Start',
    helpQuickStartText: '<strong>AniGO</strong> is Go (Baduk) with magic champions! Pick a champion, place stones, cast spells, and control the board.',
    helpBasicsTitle: 'The Basics',
    helpBoardTitle: 'The Board',
    helpBoardText: 'Play on a <strong>9x9 grid</strong>. Put stones where the lines cross (not inside the squares).',
    helpTurnsTitle: 'Taking Turns',
    helpTurnsText: '<strong>Black goes first.</strong> Take turns placing one stone each. You can also <strong>pass</strong> to skip your turn and get +2 Chi.',
    helpCaptureTitle: 'Capturing Stones',
    helpCaptureText1: 'Every stone needs <strong>open spaces</strong> next to it (up, down, left, right) to stay alive. These open spaces are called "liberties."',
    helpCaptureText2: 'If you <strong>surround an enemy stone</strong> so it has zero open spaces, you capture it! It gets removed and you get +1 Chi.',
    helpWinTitle: 'How to Win',
    helpWinText: 'When both players pass in a row, the game ends. <strong>Your stones + empty spaces you surrounded = your score.</strong> White gets +5.5 bonus for going second.',
    helpChampionsTitle: 'Champions',
    helpChampionsText: 'Before the game, pick a champion. Each has a <strong>passive ability</strong> and <strong>3 unique spells</strong>.',
    helpChiTitle: 'Chi = Your Magic Energy',
    helpChiText: 'You spend Chi to cast spells.',
    helpChiStart: '<strong>Start with:</strong> 3 Chi',
    helpChiPerTurn: '<strong>Each turn:</strong> +1 Chi',
    helpChiCapture: '<strong>Capture a stone:</strong> +1 Chi',
    helpChiPass: '<strong>Pass your turn:</strong> +2 Chi',
    helpChiMax: '<strong>Max:</strong> 10 Chi',
    helpUsingTitle: 'Using Spells',
    helpUsingText: 'On your turn you can do one of these:',
    helpUsingPlace: '<strong>Place a stone</strong> (normal move)',
    helpUsingCast: '<strong>Cast a spell</strong> (click the card, then click the board)',
    helpUsingCombo: '<strong>Stone + Spell together</strong> (costs +1 extra Chi)',
    helpUsingPass: '<strong>Pass</strong> (skip turn, get +2 Chi)',

    helpTipsTitle: 'Tips for New Players',
    helpTip1: '<strong>Start in the corners!</strong> Easiest place to claim territory.',
    helpTip2: '<strong>Keep your stones together.</strong> Connected groups are harder to capture.',
    helpTip3: '<strong>Save your Chi.</strong> Don\'t spend it all early -- save some for emergencies!',

    helpControlsTitle: 'Controls',
    helpControlPlace: 'Place a stone',
    helpControlPlaceDesc: 'Click where lines cross',
    helpControlCast: 'Cast a spell',
    helpControlCastDesc: 'Click a spell card, then click the board',
    helpControlCancel: 'Cancel spell',
    helpControlCancelDesc: 'Right-click or press Escape',
    helpControlPass: 'Pass turn',
    helpControlPassDesc: 'Click the "Pass" button',
    helpControlEnd: 'End game',
    helpControlEndDesc: 'Both players pass in a row',

    helpGlossaryTitle: 'Word Guide',
    glossaryLiberty: 'Liberty',
    glossaryLibertyDesc: 'An open space next to a stone (up/down/left/right)',
    glossaryAtari: 'Atari',
    glossaryAtariDesc: 'A stone with only 1 open space left -- about to be captured!',
    glossaryCapture: 'Capture',
    glossaryCaptureDesc: 'Surround a stone completely and it gets removed',
    glossaryKo: 'Ko',
    glossaryKoDesc: 'You can\'t take back a stone that just took yours (no infinite loops!)',
    glossaryTerritory: 'Territory',
    glossaryTerritoryDesc: 'Empty spaces surrounded by your stones = your points',
    glossaryKomi: 'Komi',
    glossaryKomiDesc: '5.5 bonus points White gets for going second',
    glossaryChi: 'Chi',
    glossaryChiDesc: 'Your magic energy for casting spells',
    glossaryCombo: 'Combo Move',
    glossaryComboDesc: 'Place a stone + cast a spell in one turn (costs +1 extra Chi)',

    // Web3 / NFT teaser strings
    web3SectionTitle: 'WEB3',
    web3ComingSoon: 'COMING SOON',
    web3NftSkins: 'NFT Spell Skins',
    web3NftSkinsDesc: 'Own limited-edition spell effects',
    web3TokenWager: 'Token Wagering',
    web3TokenWagerDesc: 'Prove your skill, earn rewards',
    web3Wallet: 'Connect Wallet',
    web3WalletDesc: 'Unlock premium rewards',
    privyLogin: 'Login with Wallet',
    privyLoginSub: 'Unlock Web3 premium features',

    // Social / Challenge strings
    challengeFriend: 'Challenge Friend',
    challengeFriendSub: 'Send a challenge via message',
    shareKakao: 'Share on KakaoTalk',
    shareTwitter: 'Share on Twitter',
    shareCopied: 'Copied!',
    inviteFriend: 'Invite Friend',
    inviteFriendDesc: 'More fun with friends',

    // Language selector
    langKR: 'KR',
    langCN: 'CN',
    langEN: 'EN',
  }
};

// ── i18n Engine ──
let currentLang = localStorage.getItem('anigo-lang') || 'ko';

/**
 * Get a translated string by key.
 * Supports template variables: t('logPlacedAt', { color: 'Black', coord: 'A1' })
 */
export function t(key, vars) {
  let str = (STRINGS[currentLang] && STRINGS[currentLang][key]) || STRINGS.en[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp('\\$\\{' + k + '\\}', 'g'), v);
    }
  }
  return str;
}

/**
 * Get the localized spell name by spell ID
 */
const SPELL_NAME_MAP = {
  stoneskin: 'spellStoneSkin',
  sanctuary: 'spellSanctuary',
  earthenwall: 'spellEarthenWall',
  shatter: 'spellShatter',
  smolder: 'spellSmolder',
  inferno: 'spellInferno',
  mirage: 'spellMirage',
  snare: 'spellSnare',
  ninelives: 'spellNineLives',
  voidrift: 'spellVoidRift',
  warpgate: 'spellWarpGate',
  phaseshift: 'spellPhaseShift',
  chainlightning: 'spellChainLightning',
  wildfire: 'spellWildfire',
  thunderveil: 'spellThunderVeil',
};

export function tSpellName(spellId) {
  return t(SPELL_NAME_MAP[spellId] || spellId);
}

/**
 * Get localized spell description (long) by spell ID
 */
const SPELL_DESC_MAP = {
  stoneskin: 'spellDescStoneSkin',
  sanctuary: 'spellDescSanctuary',
  earthenwall: 'spellDescEarthenWall',
  shatter: 'spellDescShatter',
  smolder: 'spellDescSmolder',
  inferno: 'spellDescInferno',
  mirage: 'spellDescMirage',
  snare: 'spellDescSnare',
  ninelives: 'spellDescNineLives',
  voidrift: 'spellDescVoidRift',
  warpgate: 'spellDescWarpGate',
  phaseshift: 'spellDescPhaseShift',
  chainlightning: 'spellDescChainLightning',
  wildfire: 'spellDescWildfire',
  thunderveil: 'spellDescThunderVeil',
};

const SPELL_DESC_SHORT_MAP = {
  stoneskin: 'spellDescShortStoneSkin',
  sanctuary: 'spellDescShortSanctuary',
  earthenwall: 'spellDescShortEarthenWall',
  shatter: 'spellDescShortShatter',
  smolder: 'spellDescShortSmolder',
  inferno: 'spellDescShortInferno',
  mirage: 'spellDescShortMirage',
  snare: 'spellDescShortSnare',
  ninelives: 'spellDescShortNineLives',
  voidrift: 'spellDescShortVoidRift',
  warpgate: 'spellDescShortWarpGate',
  phaseshift: 'spellDescShortPhaseShift',
  chainlightning: 'spellDescShortChainLightning',
  wildfire: 'spellDescShortWildfire',
  thunderveil: 'spellDescShortThunderVeil',
};

export function tSpellDesc(spellId) {
  return t(SPELL_DESC_MAP[spellId] || spellId);
}

export function tSpellDescShort(spellId) {
  return t(SPELL_DESC_SHORT_MAP[spellId] || spellId);
}

/**
 * Get spell category label
 */
const CAT_MAP = {
  offensive: 'catAttack',
  defensive: 'catDefense',
  info: 'catTrick',
  terrain: 'catTerrain',
  trap: 'catTrap',
};

export function tCategory(category) {
  return t(CAT_MAP[category] || category);
}

/**
 * Get localized champion name by champion ID
 */
const CHAMP_NAME_MAP = {
  seolhwa: 'champSeolhwa',
  ryujin: 'champRyujin',
  kumiho: 'champKumiho',
  musubi: 'champMusubi',
  raijin: 'champRaijin',
};

export function tChampName(champId) {
  return t(CHAMP_NAME_MAP[champId] || champId);
}

/**
 * Get localized champion title
 */
const CHAMP_TITLE_MAP = {
  seolhwa: 'titleSeolhwa',
  ryujin: 'titleRyujin',
  kumiho: 'titleKumiho',
  musubi: 'titleMusubi',
  raijin: 'titleRaijin',
};

export function tChampTitle(champId) {
  return t(CHAMP_TITLE_MAP[champId] || champId);
}

/**
 * Get localized archetype name
 */
const ARCHETYPE_MAP = {
  'Control': 'archetypeControl',
  'Aggro': 'archetypeAggro',
  'Trickster': 'archetypeTrickster',
  'Board Modifier': 'archetypeBoardModifier',
  'Chaos': 'archetypeChaos',
};

export function tArchetype(archetype) {
  return t(ARCHETYPE_MAP[archetype] || archetype);
}

/**
 * Get localized passive name
 */
const PASSIVE_NAME_MAP = {
  'Permafrost': 'passivePermafrost',
  "Dragon's Hunger": 'passiveDragonsHunger',
  "Fox's Cunning": 'passiveFoxsCunning',
  'Spatial Anomaly': 'passiveSpatialAnomaly',
  'Eye of the Storm': 'passiveEyeOfStorm',
};

export function tPassiveName(name) {
  return t(PASSIVE_NAME_MAP[name] || name);
}

/**
 * Get localized passive description
 */
const PASSIVE_DESC_MAP = {
  'Permafrost': 'passivePermafrostDesc',
  "Dragon's Hunger": 'passiveDragonsHungerDesc',
  "Fox's Cunning": 'passiveFoxsCunningDesc',
  'Spatial Anomaly': 'passiveSpatialAnomalyDesc',
  'Eye of the Storm': 'passiveEyeOfStormDesc',
};

export function tPassiveDesc(name) {
  return t(PASSIVE_DESC_MAP[name] || name);
}

/**
 * Get localized champion pitch
 */
const CHAMP_PITCH_MAP = {
  seolhwa: 'pitchSeolhwa',
  ryujin: 'pitchRyujin',
  kumiho: 'pitchKumiho',
  musubi: 'pitchMusubi',
  raijin: 'pitchRaijin',
};

export function tChampPitch(champId) {
  return t(CHAMP_PITCH_MAP[champId] || champId);
}

/**
 * Get localized color name
 */
export function tColor(color) {
  if (color === 1 || color === 'Black' || color === 'black') return t('black');
  if (color === 2 || color === 'White' || color === 'white') return t('white');
  return String(color);
}

/**
 * Set language and save to localStorage
 */
export function setLang(lang) {
  if (STRINGS[lang]) {
    currentLang = lang;
    localStorage.setItem('anigo-lang', lang);
  }
}

/**
 * Get current language code
 */
export function getLang() {
  return currentLang;
}

/**
 * Get list of available languages
 */
export function getAvailableLangs() {
  return Object.keys(STRINGS);
}

/**
 * Render the How to Play modal content dynamically using i18n strings.
 * Updated for Champion system.
 * Returns HTML string.
 */
export function renderHowToPlayHTML(champions) {
  let champCards = '';
  if (champions && champions.length > 0) {
    champCards = champions.map(c => `
        <div class="help-card">
          <h3 style="color:${c.color}">${tChampName(c.id)} - ${tChampTitle(c.id)}</h3>
          <p><strong>${t('passiveLabel')}:</strong> ${tPassiveName(c.passive.name)} - ${tPassiveDesc(c.passive.name)}</p>
          <p><strong>${t('yourSpells')}:</strong> ${c.spells.map(s => `${tSpellName(s.id)} (${s.cost} ${t('chi')}, ${s.uses}x)`).join(', ')}</p>
        </div>
    `).join('');
  }

  return `
    <button id="btn-close-help" class="modal-close" aria-label="Close">&times;</button>
    <div class="modal-scroll">

      <h1 class="help-title">${t('helpTitle')}</h1>

      <!-- QUICK START -->
      <div class="help-card highlight" style="margin-bottom: 24px;">
        <h3><svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;vertical-align:middle;color:var(--chi-gold);margin-right:6px;"><path d="M8 5v14l11-7z"/></svg> ${t('helpQuickStartTitle')}</h3>
        <p>${t('helpQuickStartText')}</p>
      </div>

      <!-- SECTION 1: Basics -->
      <h2 class="help-section-title">${t('helpBasicsTitle')}</h2>
      <div class="help-card">
        <h3>${t('helpBoardTitle')}</h3>
        <p>${t('helpBoardText')}</p>
      </div>
      <div class="help-card">
        <h3>${t('helpTurnsTitle')}</h3>
        <p>${t('helpTurnsText')}</p>
      </div>
      <div class="help-card">
        <h3>${t('helpCaptureTitle')}</h3>
        <p>${t('helpCaptureText1')}</p>
        <p>${t('helpCaptureText2')}</p>
      </div>
      <div class="help-card">
        <h3>${t('helpWinTitle')}</h3>
        <p>${t('helpWinText')}</p>
      </div>

      <!-- SECTION 2: Champions -->
      <h2 class="help-section-title">${t('helpChampionsTitle')}</h2>
      <div class="help-card highlight">
        <p>${t('helpChampionsText')}</p>
      </div>
      ${champCards}

      <!-- SECTION 3: Chi & Spells -->
      <h2 class="help-section-title">${t('helpChiTitle')}</h2>
      <div class="help-card highlight">
        <p>${t('helpChiText')}</p>
        <ul>
          <li>${t('helpChiStart')}</li>
          <li>${t('helpChiPerTurn')}</li>
          <li>${t('helpChiCapture')}</li>
          <li>${t('helpChiPass')}</li>
          <li>${t('helpChiMax')}</li>
        </ul>
      </div>
      <div class="help-card">
        <h3>${t('helpUsingTitle')}</h3>
        <p>${t('helpUsingText')}</p>
        <ul>
          <li>${t('helpUsingPlace')}</li>
          <li>${t('helpUsingCast')}</li>
          <li>${t('helpUsingCombo')}</li>
          <li>${t('helpUsingPass')}</li>
        </ul>
      </div>

      <!-- SECTION 4: Tips -->
      <h2 class="help-section-title">${t('helpTipsTitle')}</h2>
      <div class="help-card">
        <ol class="help-tips-list">
          <li>${t('helpTip1')}</li>
          <li>${t('helpTip2')}</li>
          <li>${t('helpTip3')}</li>
        </ol>
      </div>

      <!-- SECTION 5: Controls -->
      <h2 class="help-section-title">${t('helpControlsTitle')}</h2>
      <div class="help-card">
        <table class="help-controls-table">
          <tr><td><strong>${t('helpControlPlace')}</strong></td><td>${t('helpControlPlaceDesc')}</td></tr>
          <tr><td><strong>${t('helpControlCast')}</strong></td><td>${t('helpControlCastDesc')}</td></tr>
          <tr><td><strong>${t('helpControlCancel')}</strong></td><td>${t('helpControlCancelDesc')}</td></tr>
          <tr><td><strong>${t('helpControlPass')}</strong></td><td>${t('helpControlPassDesc')}</td></tr>
          <tr><td><strong>${t('helpControlEnd')}</strong></td><td>${t('helpControlEndDesc')}</td></tr>
        </table>
      </div>

      <!-- SECTION 6: Glossary -->
      <h2 class="help-section-title">${t('helpGlossaryTitle')}</h2>
      <div class="help-card">
        <table class="help-controls-table">
          <tr><td><strong>${t('glossaryLiberty')}</strong></td><td>${t('glossaryLibertyDesc')}</td></tr>
          <tr><td><strong>${t('glossaryAtari')}</strong></td><td>${t('glossaryAtariDesc')}</td></tr>
          <tr><td><strong>${t('glossaryCapture')}</strong></td><td>${t('glossaryCaptureDesc')}</td></tr>
          <tr><td><strong>${t('glossaryKo')}</strong></td><td>${t('glossaryKoDesc')}</td></tr>
          <tr><td><strong>${t('glossaryTerritory')}</strong></td><td>${t('glossaryTerritoryDesc')}</td></tr>
          <tr><td><strong>${t('glossaryKomi')}</strong></td><td>${t('glossaryKomiDesc')}</td></tr>
          <tr><td><strong>${t('glossaryChi')}</strong></td><td>${t('glossaryChiDesc')}</td></tr>
          <tr><td><strong>${t('glossaryCombo')}</strong></td><td>${t('glossaryComboDesc')}</td></tr>
        </table>
      </div>

    </div>
  `;
}
