$(function() {
	// 访问档位由 /api/game-access 返回：guest=游客 / free=免费用户 / member=会员
	// 规则：游客每日 3 次抽卡且仅恋爱版；免费用户仅恋爱版、不限抽卡；会员全部版本无限畅玩
	let access = null;
	const FREE_VERSIONS = ['lover0'];

	let card_version = localStorage.getItem('card_version') || 'lover0';

	let title = {
		'lover0': '恋爱版',
		'lover1': '热恋版',
		'sex0': '同居版',
		'sex1': '进阶版',
		'sex2': '私密版',
		'sm': 'sm版',
		'huwai': '户外版',
		'nvpu': '女仆版',
		'nanpu': '男仆版',
		'custom': '自定义',
	};

	function normalizeVersion() {
		if (access && access.role !== 'member' && FREE_VERSIONS.indexOf(card_version) === -1) {
			card_version = 'lover0';
			localStorage.setItem('card_version', 'lover0');
		}
	}

	let tasks = levels[card_version];

	$('#title').text(title[card_version]);

	function paywallHtml() {
		if (access && access.role === 'guest') {
			return '今日 3 次免费体验已用完，<a href="/login">登录</a> 后继续，或 <a href="/premium">升级会员</a> 无限畅玩全部版本';
		}
		return '该版本为会员专享，<a href="/premium">升级会员</a> 无限畅玩全部版本';
	}

	function recordGuestPlay() {
		fetch('/api/game-access', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ surface: 'card' }),
		}).then(function(r) { return r.json(); }).then(function(d) {
			if (d && typeof d.remaining === 'number' && access) access.remaining = d.remaining;
		}).catch(function() {});
		// 本地按天计数（双层计数的前端层）
		try {
			var k = 'card_draws_' + new Date().toISOString().slice(0, 10);
			localStorage.setItem(k, String((parseInt(localStorage.getItem(k) || '0', 10) || 0) + 1));
		} catch (e) {}
	}

	fetch('/api/game-access?surface=card').then(function(r) { return r.json(); }).then(function(info) {
		access = info || { role: 'guest', remaining: 0 };
		normalizeVersion();
		tasks = levels[card_version];
		$('#title').text(title[card_version]);
	}).catch(function() {});

	$('#card').on('change', () => {
		$('#content').text('')
		if (!$('#card')[0].checked) {
			new Howl({
				src: '/Gold2.wav',
				format: ["mp3"],
				autoplay: true,
				onload: function() {
					window.voice = null;
				},
			});

			// 档位信息未就绪时从严处理，避免越权抽卡
			if (!access) {
				$('#content').text('正在加载，请稍后再抽');
				return;
			}
			// 游客每日 3 次：本地预检 + 后端按 IP 复核
			if (access.role === 'guest' && access.remaining <= 0) {
				$('#content').html(paywallHtml());
				return;
			}
			normalizeVersion();
			tasks = levels[card_version];
			// 非会员仅恋爱版
			if (access.role !== 'member' && FREE_VERSIONS.indexOf(card_version) === -1) {
				$('#content').html(paywallHtml());
				return;
			}
			setTimeout(function() {
				$('#content').text(tasks[Math.floor(tasks.length * Math.random())]);
			}, 200)
			if (access.role === 'guest') {
				if (access.remaining > 0) access.remaining--;
				recordGuestPlay();
			}
		}
	})
});
