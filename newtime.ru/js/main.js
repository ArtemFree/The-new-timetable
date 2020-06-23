function delCharSTR(oldStr){
	return oldStr.replace(new RegExp(' ','gi'), '').replace(new RegExp('-','gi'), '').replace(new RegExp('\/','gi'), '').replace('(', '').replace(')', '');
}
function delCharReg(oldStr){
	return oldStr.replace(' ', '').replace('-', '').replace("/", '').replace("(", '').replace(")", '');
}

console.log(window.history.state);


$(document).ready(function(){

	// переход по истории
	window.addEventListener ("popstate", function (e) {
		
		console.log(e.state);
		main_input.val(e.state.name);
		let inst = 'undefined';
		for (let index = 0; index < groups.length; index++) {
			if (e.state.name == groups[index].name){
				inst = groups[index].institute;
				// localStorage.setItem('inst', inst);
			}
		}
		console.log(inst);
		anime({
			targets: ['.weekdays'],
			duration: 200, 
			opacity: 0,
			scale: 0.99,
			easing: 'easeInOutQuad',
			complete: function(){

				$('.preloader').removeClass('preloader_invis');
				// window.history.pushState({'name' : e.state.name}, null, null);

				makeTimetable(function(){
					setInformation(inst);
					showResult();
					// getSubToday();
					getSubTodayNew();
					IS_TIMETABLE_LOADED = true;
					// console.log(IS_TIMETABLE_LOADED);

					$('.preloader').addClass('preloader_invis');
					$('.contact').addClass('contact_visible');
				});
			}
		});
		localStorage.setItem('group', e.state.name);


	});

	var groups = []
	$.getJSON('//edu.sfu-kras.ru/api/timetable/groups', false, function(data){
		$.each(data, function(key, value){
			groups.push(value);
		});

		// console.log(groups);

		// if(localStorage.getItem('group') === $('.main-input').val()) repaint();
		if (localStorage.getItem('group') != undefined){
			$('.preloader').removeClass('preloader_invis');
			window.history.pushState({'name' : localStorage.getItem('group')}, null, null);
			repaint();
		}

		else{
			$('.preloader').addClass('preloader_invis');
		}
	});

	$.getJSON('//edu.sfu-kras.ru/api/timetable/teachers', false, function(data){
		$.each(data, function(key, value){
			groups.push(value);
		});
	});
	function SBClick(subgroup, i, inst, IS_TIMETABLE_LOADED, main_input){
		$('.subgroup_name_new').eq(i).click(function(){
			// console.log('Вызов');
			// console.log(subgroup);
			main_input.val(subgroup);
			anime({
				targets: ['.weekdays', '.information'],
				duration: 200, 
				opacity: 0,
				scale: 0.99,
				easing: 'easeInOutQuad',
				complete: function(){

					$('.preloader').removeClass('preloader_invis');
					window.history.pushState({'name' : subgroup}, null, null);

					makeTimetable(function(){
						setInformation(inst);
						showResult();
						// getSubToday();
						getSubTodayNew();
						IS_TIMETABLE_LOADED = true;
						// console.log(IS_TIMETABLE_LOADED);

						$('.preloader').addClass('preloader_invis');
						$('.contact').addClass('contact_visible');
					});
				}
			});
			localStorage.setItem('group', subgroup);
		});
	}

	// ОБЩИЕ ДАННЫЕ

	let BASE_API_URL = '//edu.sfu-kras.ru/api/timetable/get&target=';
	var IS_TIMETABLE_LOADED = false;
	var getSubTodayNewInterval;
	let insts = {
		'Институт архитектуры и дизайна' : 'ИАД',
		'Институт фундаментальной биологии и биотехнологии' : 'ИФББ',
		'Институт космических и информационных технологий' : 'ИКИТ',
		'Торгово-экономический институт' : 'ТЭИ',
		'Военно-инженерный институт' : 'ВИИ',
		'Институт филологии и языковой коммуникации' : 'ИФиЯК',
		'Институт экономики, управления и природопользования' : 'ИЭУП',
		'Институт нефти и газа' : 'ИНГ',
		'Институт горного дела, геологии и геотехнологий' : 'ИГДГиГ',
		'Гуманитарный институт' : 'ГИ',
		'Инженерно-строительный институт' : 'ИСИ',
		'Институт математики и фундаментальной информатики' : 'ИМФИ',
		'Политехнический институт' : 'ПИ',
		'Институт управления бизнес-процессами и экономики' : 'ИУБПЭ',
		'Институт инженерной физики и радиоэлектроники' : 'ИИФиРЭ',
		'Институт физической культуры, спорта и туризма' : 'ИФКСТ',
		'Институт педагогики, психологии и социологии' : 'ИППС',
		'Институт цветных металлов и материаловедения' : 'ИЦММ',
		'Институт экологии и географии' : 'ИЭГ',
		'Институт гастрономии' : 'ИГ',
		'Юридический институт' : 'ЮИ'
	}

	let subject_nums = {
		'08:30-10:05' : '1',
		'10:15-11:50' : '2',
		'12:00-13:35' : '3',
		'14:10-15:45' : '4',
		'15:55-17:30' : '5',
		'17:40-19:15' : '6',
		'19:25-21:00' : '7',
		'21:10-22:40' : '8'
	}

	let months = {
		'0' : 'января',
		'1' : 'февраля',
		'2' : 'марта',
		'3' : 'апреля',
		'4' : 'мая',
		'5' : 'июня',
		'6' : 'июля',
		'7' : 'августа',
		'8' : 'сентября',
		'9' : 'октября',
		'10' : 'ноября',
		'11' : 'декабря'
	}

	function calcTime(offset) {
		// create Date object for current location
		var d = new Date();
	
		// convert to msec
		// subtract local time zone offset
		// get UTC time in msec
		var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
	
		// create new Date object for different city
		// using supplied offset
		var nd = new Date(utc + (3600000*offset));
	
		// return time as a string
		return nd;
	}

	// console.log('Время сейчас - ', + calcTime('+7').getHours());




	// РЕЗУЛЬТАТ ПОИСКА - SUGGESTION

	let suggestion = $('.suggestion');
	let suggest = $('.suggest');
	let main_input = $('.main-input');
	let suggestion_active = false;

	function hideSuggestionBySuggestClick(){
		suggestion.removeClass('suggestion_visible');
		suggestion_active = false;
		suggest.filter('.suggest_hovered').removeClass('suggest_hovered');
	}

	function showSuggestion(){
		if (!suggestion_active && main_input.val().length > 0){
			suggestion.addClass('suggestion_visible');
			suggestion_active = true;
		}

		else if (suggestion_active && main_input.val().length == 0){
			suggestion.removeClass('suggestion_visible');
			suggestion_active = false;
			suggest.filter('.suggest_hovered').removeClass('suggest_hovered');
		}
	}

	// делаем расписание
	function makeTimetable(callback){
		$('.weekdays').html('');
		$('.today__block-today').html('');
		
		let date_day = new Date().getDate();
		let date_month = new Date().getMonth();
		let week_days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
		let week_days_for_date = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
		let groupName;

		if (localStorage.getItem('group') != undefined)
			groupName = localStorage.getItem('group');
		else
			groupName = $('.main-input').val().toLowerCase();

		$.getJSON(BASE_API_URL + groupName, function(data){
			// console.log(data);

			let date = new Date();
			let currentWeekDay = date.getDay();
			// 1481
			console.log(currentWeekDay);
			let currentDay = date.getDate();
			let currentWeek = getWeekNum(date.getDate(), date.getMonth(), date.getFullYear());
			
			let currentWeekWord;
			if (currentWeek == 1)
				currentWeekWord = 'Нечётный день';
			else
				currentWeekWord = 'Чётный день';

			let day_num = [];
			for (let i = 0; i <= data.timetable.length - 1; i++) {
				day_num.push(data.timetable[i].day);
			}

			let s = 1;
			for (let q= 1; q < day_num.length; ++q) {
				if (day_num[q] !== day_num[q-1]) {
					day_num[s++] = day_num[q];
				}
			}

			day_num.length = s;

			let isUseDay = [false, false, false, false, false, false, false]
			for(var i = 0; i < day_num.length; i++){
				isUseDay[day_num[i]-1] = true
			}

			let today = false;
				
			for (let i = 1; i < 7; i++) {
				if (isUseDay[i-1]){

					if (!today){
						$('.today__block-today').append('<div class="today__container today__container_today">'
						+'<div class="today__header"><div class="today__header-content">'
						+ '<div class="today__header-title-block">'
						+ '<div class="today__header-title-day today__header-title-day_active today">Сегодня</div>'
						+ '<div class="today__header-title-day tomorrow">Завтра</div>'
						+ '</div><div class="today__header-date">'+ week_days_for_date[currentWeekDay]+ ', ' + currentDay + ' ' + months[date_month]+'</div>'
						+ '</div><hr class="today__header-divider"></div>');

						// console.log(currentWeekDay + ' день недели');

						for (let j = 0; j <= data.timetable.length - 1; j++) {
							if (data.timetable[j].day == currentWeekDay && data.timetable[j].week == currentWeek){
								let subject_num = subject_nums[data.timetable[j].time];
								let subject_type = data.timetable[j].type;
								if (subject_type == 'лабораторная работа')
									subject_type = 'лаб. работа';

								$('.today__container').last().append('<div data-time="'+ data.timetable[j].time +'" class="today__content today__content_today"><div class="today__content-subject">'
								+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
								+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
								+ '<div class="today__header-title-circle"></div>'
								+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
								+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div></div>'
								+ '<div class="today__content-subject-middle"><div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>');
								
								if (data.timetable[j].place != ''){
									$('.today__content-subject-middle').last().append('<div class="today__content-subject-information">'
									+ '<div class="today__content-subject-information-date">'+ data.timetable[j].place +'</div>'
									+ '</div></div>');
								}

								if (data.timetable[j].place != '' && data.timetable[j].teacher != ''){
									$('.today__content-subject-information').last().append('<div class="today__header-title-circle today__header-title-circle_hidden-small"></div>');
								}

								if (data.type == 'group' && data.timetable[j].teacher != ''){
									$('.today__content-subject-information').last().append('<div class="today__content-subject-information-teacher">'
									+ '<span data-url="'+BASE_API_URL + data.timetable[j].teacher +'" class="today__content-subject-information-teacher_group">'+ data.timetable[j].teacher +'</span>'
									+ '</div></div>');

									$('.today__content-subject-information-teacher_group').last().click(function(){
										main_input.val($(this).html());
										let nameForHistory = $(this).html();
										localStorage.setItem('group', $(this).html());
										let inst = 'undefined';
										// for (let index = 0; index < groups.length; index++) {
										// 	if ($(this).html() == groups[index].name){
										// 		inst = groups[index].institute;
										// 		localStorage.setItem('inst', inst);
										// 	}
										// }
										console.log('это институт ' + inst);
										anime({
											targets: ['.weekdays', '.information'],
											duration: 200, 
											opacity: 0,
											scale: 0.99,
											easing: 'easeInOutQuad',
											complete: function(){
												$('.preloader').removeClass('preloader_invis');
												window.history.pushState({'name' : nameForHistory}, null, null);
												makeTimetable(function(){
													setInformation(inst);
													showResult();
													getSubTodayNew();
													// getSubToday();
													IS_TIMETABLE_LOADED = true;
													$('.preloader').addClass('preloader_invis');
													$('.contact').addClass('contact_visible');
												});
											}
										});
									});
								}

								if (data.type == 'teacher'){
									$('.today__content-subject-information').last().append('<div class="today__content-subject-information-teacher">'
									+ '</div></div>');

									if (data.timetable[j].groups.length == 1){
										$('.today__content-subject-information-teacher').last().html(
											data.timetable[j].groups
										);
									}

									else{
										let groups_str;
										$('.today__content-subject-information-teacher').last().html('');
										for (let o = 0; o <= data.timetable[j].groups.length - 1; o++){
											groups_str += data.timetable[j].groups[o] + ' <span class="desktop">&#183</span> <br class="mobile"> ';
										}
										$('.today__content-subject-information-teacher').last().html(groups_str.substr(0, groups_str.length - 6).replace('undefined', ''));
									}
								}
								
								
								$('.today__container').last().append('</div></div></div></div></div><hr class="today__header-divider">');
								$('.today__content today__content_inactive').last().remove();
							}

							else if (data.timetable[j].day == currentWeekDay + 1 && currentWeekDay != 0 && data.timetable[j].week == currentWeek){
								let subject_num = subject_nums[data.timetable[j].time];
								let subject_type = data.timetable[j].type;
								if (subject_type == 'лабораторная работа')
									subject_type = 'лаб. работа';

								$('.today__container').last().append('<div class="today__content today__content_tomorrow"><div class="today__content-subject">'
								+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
								+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
								+ '<div class="today__header-title-circle"></div>'
								+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
								+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div></div>'
								+ '<div class="today__content-subject-middle"><div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>');
								
								if (data.timetable[j].place != ''){
									$('.today__content-subject-middle').last().append('<div class="today__content-subject-information">'
									+ '<div class="today__content-subject-information-date">'+ data.timetable[j].place +'</div>'
									+ '</div></div>');
								}

								if (data.timetable[j].place != '' && data.timetable[j].teacher != ''){
									$('.today__content-subject-information').last().append('<div class="today__header-title-circle today__header-title-circle_hidden-small"></div>');
								}

								if (data.type == 'group' && data.timetable[j].teacher != ''){
									$('.today__content-subject-information').last().append('<div class="today__content-subject-information-teacher">'
									+ '<span data-url="'+BASE_API_URL + data.timetable[j].teacher +'" class="today__content-subject-information-teacher_group">'+ data.timetable[j].teacher +'</span>'
									+ '</div></div>');

									$('.today__content-subject-information-teacher_group').last().click(function(){
										main_input.val($(this).html());
										localStorage.setItem('group', $(this).html());
										let nameForHistory = $(this).html();
										let inst = 'undefined';
										// for (let index = 0; index < groups.length; index++) {
										// 	if ($(this).html() == groups[index].name){
										// 		inst = groups[index].institute;
										// 		localStorage.setItem('inst', inst);
										// 	}
										// }
										anime({
											targets: ['.weekdays', '.information'],
											duration: 200, 
											opacity: 0,
											scale: 0.99,
											easing: 'easeInOutQuad',
											complete: function(){
												$('.preloader').removeClass('preloader_invis');
												window.history.pushState({'name' : nameForHistory}, null, null);
												makeTimetable(function(){
													setInformation(inst);
													showResult();
													getSubTodayNew();
													// getSubToday();
													IS_TIMETABLE_LOADED = true;
													$('.preloader').addClass('preloader_invis');
													$('.contact').addClass('contact_visible');
												});
											}
										});
									});
								}

								if (data.type == 'teacher'){
									$('.today__content-subject-information').last().append('<div class="today__content-subject-information-teacher">'
									+ '</div></div>');

									if (data.timetable[j].groups.length == 1){
										$('.today__content-subject-information-teacher').last().html(
											data.timetable[j].groups
										);
									}

									else{
										let groups_str;
										$('.today__content-subject-information-teacher').last().html('');
										for (let o = 0; o <= data.timetable[j].groups.length - 1; o++){
											groups_str += data.timetable[j].groups[o] + ' <span class="desktop">&#183</span> <br class="mobile"> ';
										}
										$('.today__content-subject-information-teacher').last().html(groups_str.substr(0, groups_str.length - 6).replace('undefined', ''));
									}
								}
								
								
								$('.today__container').last().append('</div></div></div></div></div><hr class="today__header-divider_inactive">')
							}

							else if (data.timetable[j].day == currentWeekDay + 1 && currentWeekDay == 0 && data.timetable[j].week != currentWeek){
								console.log('завтра понедельник');
								let subject_num = subject_nums[data.timetable[j].time];
								let subject_type = data.timetable[j].type;
								if (subject_type == 'лабораторная работа')
									subject_type = 'лаб. работа';

								$('.today__container').last().append('<div class="today__content today__content_tomorrow"><div class="today__content-subject">'
								+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
								+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
								+ '<div class="today__header-title-circle"></div>'
								+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
								+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div></div>'
								+ '<div class="today__content-subject-middle"><div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>');
								
								if (data.timetable[j].place != ''){
									$('.today__content-subject-middle').last().append('<div class="today__content-subject-information">'
									+ '<div class="today__content-subject-information-date">'+ data.timetable[j].place +'</div>'
									+ '</div></div>');
								}

								if (data.timetable[j].place != '' && data.timetable[j].teacher != ''){
									$('.today__content-subject-information').last().append('<div class="today__header-title-circle today__header-title-circle_hidden-small"></div>');
								}

								if (data.type == 'group' && data.timetable[j].teacher != ''){
									$('.today__content-subject-information').last().append('<div class="today__content-subject-information-teacher">'
									+ '<span data-url="'+BASE_API_URL + data.timetable[j].teacher +'" class="today__content-subject-information-teacher_group">'+ data.timetable[j].teacher +'</span>'
									+ '</div></div>');

									$('.today__content-subject-information-teacher_group').last().click(function(){
										main_input.val($(this).html());
										localStorage.setItem('group', $(this).html());
										let nameForHistory = $(this).html();
										let inst = 'undefined';
										// for (let index = 0; index < groups.length; index++) {
										// 	if ($(this).html() == groups[index].name){
										// 		inst = groups[index].institute;
										// 		localStorage.setItem('inst', inst);
										// 	}
										// }
										anime({
											targets: ['.weekdays', '.information'],
											duration: 200, 
											opacity: 0,
											scale: 0.99,
											easing: 'easeInOutQuad',
											complete: function(){
												$('.preloader').removeClass('preloader_invis');
												window.history.pushState({'name' : nameForHistory}, null, null);
												makeTimetable(function(){
													setInformation(inst);
													showResult();
													getSubTodayNew();
													// getSubToday();
													IS_TIMETABLE_LOADED = true;
													$('.preloader').addClass('preloader_invis');
													$('.contact').addClass('contact_visible');
												});
											}
										});
									});
								}

								if (data.type == 'teacher'){
									$('.today__content-subject-information').last().append('<div class="today__content-subject-information-teacher">'
									+ '</div></div>');

									if (data.timetable[j].groups.length == 1){
										$('.today__content-subject-information-teacher').last().html(
											data.timetable[j].groups
										);
									}

									else{
										let groups_str;
										$('.today__content-subject-information-teacher').last().html('');
										for (let o = 0; o <= data.timetable[j].groups.length - 1; o++){
											groups_str += data.timetable[j].groups[o] + ' <span class="desktop">&#183</span> <br class="mobile"> ';
										}
										$('.today__content-subject-information-teacher').last().html(groups_str.substr(0, groups_str.length - 6).replace('undefined', ''));
									}
								}
								
								
								$('.today__container').last().append('</div></div></div></div></div><hr class="today__header-divider_inactive">')
							}
						}


						// $('.today__header-divider').last().css('display', 'none');

						today = true;
					}



					$('.weekdays').append('<div id="'+ i +'" class="today__container today__container_weekday"><div class="today__header">'
					+'<div class="today__header-content"><div class="today__header-title-block_weekday">'
					+'<div class="today__header-title-weekday">'+ week_days[i - 1] +'</div>'
					+'<button class="today__header-change-week-button"><img class="today__header-change-week-button-icon" src="img/cached-24px.svg" alt="Иконка смены">'
					+'<div class="today__header-change-week-button-content">'+ currentWeekWord +'</div></button></div>'
					+'</div></div>'
					+'<hr class="today__header-divider">'
					+'</div></div>');
					for (let j = 0; j <= data.timetable.length - 1; j++) {
	
						if (data.timetable[j].day == i && data.timetable[j].week == currentWeek
							&& data.timetable[j].teacher != '' && data.timetable[j].place != ''){
							
							let subject_num = subject_nums[data.timetable[j].time];
							let subject_type = data.timetable[j].type;
							if (subject_type == 'лабораторная работа')
								subject_type = 'лаб. работа';

							$('.today__container').last().append('<div class="today__content today__content_active"><div class="today__content-subject">'
							+ '<div class="today__content-subject-middle">'
							+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
							+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
							+ '<div class="today__header-title-circle"></div>'
							+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
							+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div>'
							+ '</div>'
							+ '<div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>'
							+ '<div class="today__content-subject-information"><div class="today__content-subject-information-date">'+ data.timetable[j].place +'</div>'
							+ '<div class="today__header-title-circle today__header-title-circle_hidden-small"></div>'
							+ '<div class="today__content-subject-information-teacher">'
							+ '<span data-url="'+BASE_API_URL + data.timetable[j].teacher +'" class="today__content-subject-information-teacher_group">'+ data.timetable[j].teacher +'</span>'
							+ '</div></div></div></div></div>'
							+ '<hr class="today__header-divider">');
						}
	
						else if (data.timetable[j].day == i && data.timetable[j].week == currentWeek
							&& data.timetable[j].teacher == '' && data.timetable[j].place != ''){
	
							let subject_num = subject_nums[data.timetable[j].time];
							let subject_type = data.timetable[j].type;
							if (subject_type == 'лабораторная работа')
								subject_type = 'лаб. работа';
	
							$('.today__container').last().append('<div class="today__content today__content_active"><div class="today__content-subject">'
							+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
							+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
							+ '<div class="today__header-title-circle"></div>'
							+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
							+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div>'
							+ '</div><div class="today__content-subject-middle"><div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>'
							+ '<div class="today__content-subject-information"><div class="today__content-subject-information-date">'+ data.timetable[j].place +'</div>'
							+ '</div></div></div></div></div>'
							+ '<hr class="today__header-divider">');
						}
	
						else if (data.timetable[j].day == i && data.timetable[j].week == currentWeek
							&& data.timetable[j].teacher != '' && data.timetable[j].place == ''){
	
							let subject_num = subject_nums[data.timetable[j].time];
							let subject_type = data.timetable[j].type;
							if (subject_type == 'лабораторная работа')
								subject_type = 'лаб. работа';
	
							$('.today__container').last().append('<div class="today__content today__content_active"><div class="today__content-subject">'
							+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
							+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
							+ '<div class="today__header-title-circle"></div>'
							+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
							+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div>'
							+ '</div><div class="today__content-subject-middle"><div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>'
							+ '<div class="today__content-subject-information">'
							+ '<div class="today__content-subject-information-teacher">'
							+ '<span data-url="'+BASE_API_URL + data.timetable[j].teacher +'" class="today__content-subject-information-teacher_group">'+ data.timetable[j].teacher +'</span>'
							+ '</div></div></div></div></div>'
							+ '<hr class="today__header-divider">');
						}
	
						else if (data.timetable[j].day == i && data.timetable[j].week == currentWeek
							&& data.timetable[j].teacher == '' && data.timetable[j].place == ''){
							
							let subject_num = subject_nums[data.timetable[j].time];
							let subject_type = data.timetable[j].type;
							if (subject_type == 'лабораторная работа')
								subject_type = 'лаб. работа';
	
							$('.today__container').last().append('<div class="today__content today__content_active"><div class="today__content-subject">'
							+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
							+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
							+ '<div class="today__header-title-circle"></div>'
							+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
							+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div>'
							+ '</div><div class="today__content-subject-middle"><div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>'
							+ '</div></div></div></div>'
							+ '<hr class="today__header-divider">');
						}


						else if (data.timetable[j].day == i && data.timetable[j].week != currentWeek
							&& data.timetable[j].teacher != '' && data.timetable[j].place != ''){
							
							let subject_num = subject_nums[data.timetable[j].time];
							let subject_type = data.timetable[j].type;
							if (subject_type == 'лабораторная работа')
								subject_type = 'лаб. работа';

							$('.today__container').last().append('<div class="today__content today__content_inactive"><div class="today__content-subject">'
							+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
							+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
							+ '<div class="today__header-title-circle"></div>'
							+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
							+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div>'
							+ '</div><div class="today__content-subject-middle"><div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>'
							+ '<div class="today__content-subject-information"><div class="today__content-subject-information-date">'+ data.timetable[j].place +'</div>'
							+ '<div class="today__header-title-circle today__header-title-circle_hidden-small"></div>'
							+ '<div class="today__content-subject-information-teacher">'
							+ '<span data-url="'+BASE_API_URL + data.timetable[j].teacher +'" class="today__content-subject-information-teacher_group">'+ data.timetable[j].teacher +'</span>'
							+ '</div></div></div></div></div>'
							+ '<hr class="today__header-divider_inactive">');
						}

						else if (data.timetable[j].day == i && data.timetable[j].week != currentWeek
							&& data.timetable[j].teacher == '' && data.timetable[j].place != ''){
	
							let subject_num = subject_nums[data.timetable[j].time];
							let subject_type = data.timetable[j].type;
							if (subject_type == 'лабораторная работа')
								subject_type = 'лаб. работа';
	
							$('.today__container').last().append('<div class="today__content today__content_inactive"><div class="today__content-subject">'
							+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
							+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
							+ '<div class="today__header-title-circle"></div>'
							+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
							+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div>'
							+ '</div><div class="today__content-subject-middle"><div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>'
							+ '<div class="today__content-subject-information"><div class="today__content-subject-information-date">'+ data.timetable[j].place +'</div>'
							+ '</div></div></div></div></div>'
							+ '<hr class="today__header-divider_inactive">');
						}

						else if (data.timetable[j].day == i && data.timetable[j].week != currentWeek
							&& data.timetable[j].teacher != '' && data.timetable[j].place == ''){
	
							let subject_num = subject_nums[data.timetable[j].time];
							let subject_type = data.timetable[j].type;
							if (subject_type == 'лабораторная работа')
								subject_type = 'лаб. работа';
	
							$('.today__container').last().append('<div class="today__content today__content_inactive"><div class="today__content-subject">'
							+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
							+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
							+ '<div class="today__header-title-circle"></div>'
							+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
							+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div>'
							+ '</div><div class="today__content-subject-middle"><div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>'
							+ '<div class="today__content-subject-information">'
							+ '<div class="today__content-subject-information-teacher">'
							+ '<span data-url="'+BASE_API_URL + data.timetable[j].teacher +'" class="today__content-subject-information-teacher_group">'+ data.timetable[j].teacher +'</span>'
							+ '</div></div></div></div></div>'
							+ '<hr class="today__header-divider_inactive">');
						}

						else if (data.timetable[j].day == i && data.timetable[j].week != currentWeek
							&& data.timetable[j].teacher == '' && data.timetable[j].place == ''){
							
							let subject_num = subject_nums[data.timetable[j].time];
							let subject_type = data.timetable[j].type;
							if (subject_type == 'лабораторная работа')
								subject_type = 'лаб. работа';
	
							$('.today__container').last().append('<div class="today__content today__content_inactive"><div class="today__content-subject">'
							+ '<div class="today__content-subject-top"><div class="today__content-subject-time">'
							+ '<div class="today__content-subject-time-content today__content-subject-time-content-time">'+ data.timetable[j].time.replace('-', '–') +'</div>'
							+ '<div class="today__header-title-circle"></div>'
							+ '<div class="today__content-subject-time-content">'+ subject_num +' пара</div></div>'
							+ '<div class="today__content-subject-type">'+ subject_type.toUpperCase() +'</div>'
							+ '</div><div class="today__content-subject-middle"><div class="today__content-subject-content">'+ data.timetable[j].subject +'</div>'
							+ '</div></div></div></div>'
							+ '<hr class="today__header-divider_inactive">');
						}

						if (data.type == 'teacher'){
							$('.today__content-subject-information-teacher_group').last().unbind('click');
							// console.log('teacher');
							if (data.timetable[j].groups.length == 1){
								$('.today__content-subject-information-teacher').last().html(
									data.timetable[j].groups
								);
							}

							else{
								let groups_str;
								$('.today__content-subject-information-teacher').last().html('');
								for (let o = 0; o <= data.timetable[j].groups.length - 1; o++){
									groups_str += data.timetable[j].groups[o] + ' <span class="desktop">&#183</span> <br class="mobile">';
								}
								// if (data.timetable[j].groups.length > 4){
								// 	$('.today__content-subject-information-teacher').last().prev().css('display', 'none');
								// 	$('.today__content-subject-information-teacher').last().parent().css('flex-flow', 'column');
								// 	$('.today__content-subject-information-teacher').last().parent().css('align-items', 'start');
								// }
								$('.today__content-subject-information-teacher').last().html(groups_str.substr(0, groups_str.length - 6).replace('undefined', ''));
							}
						}

						else if (data.type == 'group'){
							$('.today__content-subject-information-teacher_group').last().unbind('click');
							$('.today__content-subject-information-teacher_group').last().click(function(){
								main_input.val($(this).html());
								let nameForHistory = $(this).html();
								localStorage.setItem('group', $(this).html());
								let inst = 'undefined';
								// for (let index = 0; index < groups.length; index++) {
								// 	if ($(this).html() == groups[index].name){
								// 		inst = groups[index].institute;
								// 		localStorage.setItem('inst', inst);
								// 	}
								// }
								anime({
									targets: ['.weekdays', '.information'],
									duration: 200, 
									opacity: 0,
									scale: 0.99,
									easing: 'easeInOutQuad',
									complete: function(){
										$('.preloader').removeClass('preloader_invis');
										window.history.pushState({'name' : nameForHistory}, null, null);
										makeTimetable(function(){
											setInformation(inst);
											showResult();
											getSubTodayNew();
											// getSubToday();
											IS_TIMETABLE_LOADED = true;
											$('.preloader').addClass('preloader_invis');
											$('.contact').addClass('contact_visible');
										});
									}
								});
							});
						}
					}

					$('.today__header-divider').last().css('display', 'none');
					date_day = date_day + 1;
				}

				
				// $('.today__content-subject-information-teacher').each(function(){
				// 	// console.log('type000 - ' + $(this).html());
				// 	if ($(this).html() == 'undefined' && data.type == 'teacher'){
				// 		// console.log('type - ' + $(this).html());
				// 		// $(this).html(data.timetable[j].groups);
				// 		$(this).css('display', 'none');
				// 		$(this).prev().css('display', 'none');
				// 	}
				// });

				$('.today__container').each(function(){

					if ($(this).children('.today__content_today').length == 0 && $(this).hasClass('today__container_today')){
						$(this).append('<div class="today__content today__content_today">'
						+'<div class="today__content-subject today__content-subject_empty">Сегодня занятий нет</div></div>');
						$(this).children('.today__header-divider').first().css('display', 'block');
						$(this).attr('data-today_empty', 'true');
						$(this).addClass('today__container_empty');
					}

					else if ($(this).children('.today__content_tomorrow').length == 0 && $(this).hasClass('today__container_today')){
						$(this).append('<div class="today__content today__content_tomorrow">'
						+'<div class="today__content-subject today__content-subject_empty">Завтра занятий нет</div></div>');
						$(this).children('.today__header-divider').first().css('display', 'block');
						$(this).attr('data-tomorrow_empty', 'true');
						// $(this).addClass('today__container_empty');
					}

					if ($(this).children('.today__content_active').length == 0 && $(this).hasClass('today__container_weekday')){
						$(this).append('<div class="today__content today__content_active">'
						+'<div class="today__content-subject today__content-subject_empty">Занятий нет</div></div>');
						$(this).children('.today__header-divider').first().css('display', 'block');
						// $(this).attr('data-currentDay_empty', 'true');
						// $(this).addClass('today__container_empty');
					}

					else if ($(this).children('.today__content_inactive').length == 0 && $(this).hasClass('today__container_weekday')){
						$(this).append('<div class="today__content today__content_inactive">'
						+'<div class="today__content-subject today__content-subject_empty">Занятий нет</div></div>');
						$(this).children('.today__header-divider').first().css('display', 'block');
						// $(this).attr('data-nextDay_empty', 'true');
						// $(this).addClass('today__container_empty');
					}
				});

				$('.today__header-change-week-button').last().on('click', function(){

					// console.log($(this).parent().parent().parent().parent().attr('id'));

					let day = $(this).parent().parent().parent().parent();
					let button = $(this);
					let weeks = ['Чётный день', 'Нечётный день']; let new_week;
					day.addClass('today__container-change-week');



					if (button.children('.today__header-change-week-button-content').html() == weeks[0])
						new_week = weeks[1];
					else
						new_week = weeks[0];

					// if (day.attr('data-nextDay_empty') == 'true'){
					// 	day.addClass('today__container_empty');
					// }
					// else{
					// 	day.removeClass('today__container_empty');
					// }


					// day.children('.today__content_active').toggleClass('today_invisible');
					// day.children('.today__content_inactive').toggleClass('today_visible');
					// day.children('.today__header-divider').toggleClass('today_invisible');
					// day.children('.today__header-divider_inactive').toggleClass('today_visible');
					// day.children('.today__header-divider').first().css('display', 'block');
					// day.children('.today__header-divider_inactive').last().toggleClass('today_invisible');
					// button.children('.today__header-change-week-button-content').html(new_week);
					// button.children('.today__header-change-week-button-icon').toggleClass('today__header-change-week-button-icon-no-active_1');
					// button.children('.today__header-change-week-button-icon-no-active').toggleClass('today__header-change-week-button-icon-active_1');
					// button.children('.today__header-change-week-button-content').toggleClass('today__header-change-week-button-content_active');

					anime({
						targets: '.today__container-change-week',
						duration: 200, 
						// opacity: 0,
						scale: 0.98,
						easing: 'easeInOutQuad',
						complete: function(){
							day.children('.today__content_active').toggleClass('today_invisible');
							day.children('.today__content_inactive').toggleClass('today_visible');
							day.children('.today__header-divider').toggleClass('today_invisible');
							day.children('.today__header-divider_inactive').toggleClass('today_visible');
							day.children('.today__header-divider').first().css('display', 'block');
							day.children('.today__header-divider_inactive').last().toggleClass('today_invisible');
							button.children('.today__header-change-week-button-content').html(new_week);
							anime({
								targets: '.today__container-change-week',
								duration: 200, 
								opacity: 1,
								scale: 1,
								easing: 'easeInOutQuad',
								complete: function(){
									day.removeClass('today__container-change-week');
								}
							});
						}
					});
				});
			}

			$('.tomorrow').on('click', function(){

				if ($(this).hasClass('today__header-title-day_active')){
					return;
				}
				$(this).toggleClass('today__header-title-day_active');
				$('.today').toggleClass('today__header-title-day_active');
				let currentNextDay = currentDay + 1;
				// <div class="today__header-date">'+ week_days[currentWeekDay]+ ', ' + currentDay + ' ' + months[date_month]+'</div>
				let day = $(this).parent().parent().parent().parent();
				if (day.attr('data-tomorrow_empty') == 'true'){
					day.addClass('today__container_empty');
				}
				else{
					day.removeClass('today__container_empty');
				}
				// day.removeClass('today__container_empty');
				// console.log(day + ' это день');

				day.children('.today__content_today').toggleClass('today_invisible');
				day.children('.today__content_tomorrow').toggleClass('today_visible');
				day.children('.today__header-divider').toggleClass('today_invisible');
				day.children('.today__header-divider_inactive').toggleClass('today_visible');
				day.children('.today__header-divider').first().css('display', 'block');
				$('.today__header-date').first().html(week_days_for_date[currentWeekDay + 1] + ', ' + currentNextDay + ' ' + months[date_month]);

				// anime({
				// 	targets: '.today__container_today',
				// 	duration: 200, 
				// 	opacity: 0,
				// 	// scale: 0.99,
				// 	easing: 'easeInOutQuad',
				// 	complete: function(){
				// 		day.children('.today__content_today').toggleClass('today_invisible');
				// 		day.children('.today__content_tomorrow').toggleClass('today_visible');
				// 		day.children('.today__header-divider').toggleClass('today_invisible');
				// 		day.children('.today__header-divider_inactive').toggleClass('today_visible');
				// 		day.children('.today__header-divider').first().css('display', 'block');
				// 		$('.today__header-date').first().html(week_days_for_date[currentWeekDay + 1] + ', ' + currentNextDay + ' ' + months[date_month]);
				// 		// day.children('.today__header-divider_inactive').last().toggleClass('today_invisible');
				// 		anime({
				// 			targets: '.today__container_today',
				// 			duration: 200, 
				// 			opacity: 1,
				// 			// scale: 1,
				// 			easing: 'easeInOutQuad',
				// 		});
				// 	}
				// });
			});

			$('.today').on('click', function(){

				if ($(this).hasClass('today__header-title-day_active')){
					return;
				}
				$(this).toggleClass('today__header-title-day_active');
				$('.tomorrow').toggleClass('today__header-title-day_active');
				let day = $(this).parent().parent().parent().parent();
				if (day.attr('data-today_empty') == 'true'){
					day.addClass('today__container_empty');
				}
				else{ day.removeClass('today__container_empty'); }
				// console.log(day + ' это день');

				day.children('.today__content_today').toggleClass('today_invisible');
				day.children('.today__content_tomorrow').toggleClass('today_visible');
				day.children('.today__header-divider').toggleClass('today_invisible');
				day.children('.today__header-divider_inactive').toggleClass('today_visible');
				day.children('.today__header-divider').first().css('display', 'block');
				$('.today__header-date').first().html(week_days_for_date[currentWeekDay] + ', ' + currentDay + ' ' + months[date_month]);

				// anime({
				// 	targets: '.today__container_today',
				// 	duration: 200, 
				// 	opacity: 0,
				// 	scale: 0.99,
				// 	easing: 'easeInOutQuad',
				// 	complete: function(){
				// 		day.children('.today__content_today').toggleClass('today_invisible');
				// 		day.children('.today__content_tomorrow').toggleClass('today_visible');
				// 		day.children('.today__header-divider').toggleClass('today_invisible');
				// 		day.children('.today__header-divider_inactive').toggleClass('today_visible');
				// 		day.children('.today__header-divider').first().css('display', 'block');
				// 		$('.today__header-date').first().html(week_days_for_date[currentWeekDay] + ', ' + currentDay + ' ' + months[date_month]);
				// 		// day.children('.today__header-divider_inactive').last().toggleClass('today_invisible');
				// 		anime({
				// 			targets: '.today__container_today',
				// 			duration: 200, 
				// 			opacity: 1,
				// 			scale: 1,
				// 			easing: 'easeInOutQuad',
				// 		});
				// 	}
				// });
			});


			//localStorage.setItem('table', JSON.stringify(data));
			callback();

		});
	}

	function setInformation(inst){
		//$('.subgroup_change_name').last().unbind('click');
		//$('.subgroup_change_name').first().unbind('click');

		let date = new Date();
		let week = getWeekNum(date.getDate(), date.getMonth(), date.getFullYear());
		$('.week-new__1').removeClass('week-new_active');
		$('.week-new__2').removeClass('week-new_active');
		$('.week-new__1').removeAttr('data-active');
		$('.week-new__2').removeAttr('data-active');
		$('.uneversity_name').removeClass('uneversity_name_teacher');
		// $('.week').html('Нечётная неделя');
		// console.log(week + 'неделя сейчас');
		if (week == 1){
			$('.week-new__1').addClass('week-new_active_permanent');
			$('.week-new__1').addClass('week-new_active');
			$('.week-new__1').attr('data-active', 'true');
		}
		else{
			$('.week-new__2').addClass('week-new_active_permanent');
			$('.week-new__2').addClass('week-new_active');
			$('.week-new__2').attr('data-active', 'true');
		}

		let name; 
		if (localStorage.getItem('group') != undefined){
			name = localStorage.getItem('group');
			main_input.val(name);
		}
		else
			name = main_input.val();

		$('.subgroup_name_new').each(function(){
			$(this).removeClass('subgroup_name_new_active');
		});

		$('.subgroups').html('');

		// Создаём паттерны поиска подгрупп
		let pat1 = RegExp('(.*)(\\(подгруппа\\s\\d\\))$');
		let pat2 = RegExp('(.*)(\\(\\d\\sподгруппа\\))$');
		let pat3 = RegExp('(.*)(\\(\\d\\))$');
		let pat4 = RegExp('(.*)\\s(\\d\\sподгруппа)$');
		let pat5 = RegExp('(.*)(\\/\\d[бмБМ])$');
		let pat6 = RegExp('(.*)(\\([абвгд]\\))$');
		
		// Определяем паттерн группы
		var GROUPwithout = "";
		var SBGroup = "";
		var isHasPattern = true;
		var isPat5 = false;
		if (pat1.test(name)){
			GROUPwithout = pat1.exec(name)[1];
			SBGroup = pat1.exec(name)[2];
			pat1.lastIndex = 0;
		} else {
			if (pat2.test(name)){
				GROUPwithout = pat2.exec(name)[1];
				SBGroup = pat2.exec(name)[2];
				pat2.lastIndex = 0;
				// console.log(pat2.exec(name));
			}else{
				if (pat3.test(name)){
					GROUPwithout = pat3.exec(name)[1];
					SBGroup = pat3.exec(name)[2];
					pat3.lastIndex = 0;
				}else{
					if (pat4.test(name)){
						GROUPwithout = pat4.exec(name)[1];
						SBGroup = pat4.exec(name)[2];
						pat4.lastIndex = 0;
					}else{
						if (pat5.test(name)){
							GROUPwithout = pat5.exec(name)[1];
							SBGroup = pat5.exec(name)[2];
							isPat5 = true;
							pat5.lastIndex = 0;
						}else{
							if (pat6.test(name)){
								GROUPwithout = pat6.exec(name)[1];
								SBGroup = pat6.exec(name)[2];
								pat6.lastIndex = 0;
							}else{
								isHasPattern = false;
							}
						}
					}
				}
			}
		}
		// Создаём массив подгрупп
		if (isHasPattern){
			var subgroups = [];
			var SubgroupsPattern
			if (isPat5){
				SubgroupsPattern = RegExp(`^${GROUPwithout}.+`);
			}else{
				SubgroupsPattern = RegExp(`^${GROUPwithout}.*`);
			}
			var CurrentSubGroup = 0;
			for(var i = 0; i < groups.length; i++){
				if(SubgroupsPattern.test(groups[i].name)){
					subgroups.push(groups[i].name);
					SubgroupsPattern.lastIndex = 0;
				}
				// console.log("100500");
			}
			for(var i = 0; i < subgroups.length; i++){
				if (subgroups[i] === name){
					CurrentSubGroup = i + 1;
					break;
				}
			}
			// console.log(CurrentSubGroup + " - Наша цель");
			// $('.subgroup_name').html(CurrentSubGroup + ' подгруппа');
			$('.group_name').html(GROUPwithout.trim());
			

			for(var i = 0; i < subgroups.length; i++){
				$('.subgroups').append('<div data-group-to-set="' + BASE_API_URL + subgroups[i] + '" class="subgroup_name_new">' + (i + 1) + ' подгруппа</div>');
				if (i != (CurrentSubGroup-1)){
					SBClick(subgroups[i], i, inst, IS_TIMETABLE_LOADED, main_input);
				}
			}

			$('.subgroup_name_new').eq(CurrentSubGroup-1).addClass('subgroup_name_new_active');
			// $('.subgroups').flickity({
			// 	// options
			// 	freeScroll: true,
			// 	draggable: true,
			// 	prevNextButtons: false,
			// 	pageDots: false
			// });
		}
		
		else{
			$('.group_name').html(name);
		}
		// console.log(inst + '00000');
		if (inst){
			for (let key in insts) {
				if (inst == key){
					inst = insts[key];
				}
			}

			// console.log(inst + '1111');
			if (inst == 'undefined'){
				inst = 'ПРЕПОДАВАТЕЛЬ';
				// console.log(inst + '2222');
				$('.uneversity_name').addClass('uneversity_name_teacher');
			}
			$('.uneversity_name').first().html(inst);
		}
	}

	function week_new_click(){
		if (!$(this).attr('data-active')){
			$('.week-new__1').removeClass('week-new_active');
			$('.week-new__2').removeClass('week-new_active');
			$('.week-new__1').removeAttr('data-active');
			$('.week-new__2').removeAttr('data-active');
			$(this).addClass('week-new_active');
			$(this).attr('data-active', 'true');
			let week_current = $(this).html();
			// console.log(week_current);
	
			$('.today__container').each(function(){
				let need_to_change;
				let day = $(this);
				let weeks = ['Чётный день', 'Нечётный день']; let new_week;
				let button = $(this).find('.today__header-change-week-button-content');
				
				// console.log(button.html());
				if (button.html() == 'Чётный день' && week_current == 'Нечётная неделя'){
					need_to_change = true;
					// console.log('меняться');
				}
				else if (button.html() == 'Нечётный день' && week_current == 'Чётная неделя'){
					need_to_change = true;
					// console.log('меняться');
				}
				else if (button.html() == 'Чётный день' && week_current == 'Чётная неделя'){
					need_to_change = false;
					// console.log('не меняться');
				}
				else if (button.html() == 'Нечётный день' && week_current == 'Нечётная неделя'){
					need_to_change = false;
					// console.log('не меняться');
				}


				if (button.html() == weeks[0])
					new_week = weeks[1];
				else
					new_week = weeks[0];


				if (need_to_change){
					day.children('.today__content_active').toggleClass('today_invisible');
					day.children('.today__content_inactive').toggleClass('today_visible');
					day.children('.today__header-divider').toggleClass('today_invisible');
					day.children('.today__header-divider_inactive').toggleClass('today_visible');
					day.children('.today__header-divider').first().css('display', 'block');
					day.children('.today__header-divider_inactive').last().toggleClass('today_invisible');
					button.html(new_week);
				}
	
				// anime({
				// 	targets: '.weekdays',
				// 	duration: 200, 
				// 	opacity: 0,
				// 	scale: 0.99,
				// 	easing: 'easeInOutQuad',
				// 	complete: function(){
				// 		if (need_to_change){
				// 			day.children('.today__content_active').toggleClass('today_invisible');
				// 			day.children('.today__content_inactive').toggleClass('today_visible');
				// 			day.children('.today__header-divider').toggleClass('today_invisible');
				// 			day.children('.today__header-divider_inactive').toggleClass('today_visible');
				// 			day.children('.today__header-divider').first().css('display', 'block');
				// 			day.children('.today__header-divider_inactive').last().toggleClass('today_invisible');
				// 			button.html(new_week);
				// 		}
				// 		anime({
				// 			targets: '.weekdays',
				// 			duration: 200, 
				// 			opacity: 1,
				// 			scale: 1,
				// 			easing: 'easeInOutQuad',
				// 		});
				// 	}
				// });
	
				// day.children('.today__content_active').toggleClass('today_invisible');
				// day.children('.today__content_inactive').toggleClass('today_visible');
				// day.children('.today__header-divider').toggleClass('today_invisible');
				// day.children('.today__header-divider_inactive').toggleClass('today_visible');
				// day.children('.today__header-divider').first().css('display', 'block');
				// day.children('.today__header-divider_inactive').last().toggleClass('today_invisible');
			});
		}

	}
	
	$('.week-new__1').click(week_new_click);
	$('.week-new__2').click(week_new_click);


	// SOKOLOV VLADISLAV CUSTOM START

	// Тут я кусок переписал полностью, теперь вроде не дергается (проверь на мобилке, но должно быть норм)
	// Получается полностью убрал скрытие элемента, нафиг надо
	// Просто в Suggestions заменяю html на новый сгенеренный

	// ввод и показ результата поиска (2 проблема)
	main_input.on('keyup', function (eventObject){
		if (eventObject.which != 27){
			let maximum = 4; let index = 0;
			let nothing = false;
			if (main_input.val().length >= 4){
				var searchField = main_input.val();
				var expression = new RegExp(delCharReg(searchField), "gi");

				let arSuggests = []
				$.each(groups, function(key, value){
					if (delCharSTR(value.name).search(expression) != -1)
					{
						nothing = false;
						if (index < maximum){
							arSuggests.push('<div class="suggest" data-teacher="'+ value.type +'" data-inst="'+ value.institute +'" data-group="'+value.name+'">'+value.name+'</div>');
							index = index + 1;
						}
					}
				});
				let shownSuggest = "";
				for(var i = 0; i < arSuggests.length; i++){
					shownSuggest += arSuggests[i]
				}
				suggestion.html(shownSuggest);
				showSuggestion()
				$('.suggest').on('click', function(){
					hideSuggestionBySuggestClick();
					main_input.val($(this).attr('data-group'));
					let nameForHistory = $(this).attr('data-group');

					let inst = $(this).attr('data-inst');

					localStorage.setItem('inst', inst);
					localStorage.setItem('name', $(this).attr('data-group'));
					localStorage.setItem('group', $(this).attr('data-group'));

					if (IS_TIMETABLE_LOADED){
						// console.log('loading');
						anime({
							targets: ['.weekdays', '.information'],
							duration: 200, 
							opacity: 0,
							scale: 0.99,
							easing: 'easeInOutQuad',
							complete: function(){
								$('.preloader').removeClass('preloader_invis');

								window.history.pushState({'name' : nameForHistory}, null, null);

								makeTimetable(function(){
									setInformation(inst);
									showResult();
									getSubTodayNew();
									// getSubToday();
									IS_TIMETABLE_LOADED = true;
									localStorage.setItem('IS_TIMETABLE_LOADED', true);
									$('.preloader').addClass('preloader_invis');
									$('.contact').addClass('contact_visible');
									// console.log(IS_TIMETABLE_LOADED);
								});
							}
						});
					}

					else{
						$('.preloader').removeClass('preloader_invis');
						window.history.pushState({'name' : nameForHistory}, null, null);
						makeTimetable(function(){
							setInformation(inst);
							showResult();
							// getSubToday();
							getSubTodayNew();
							IS_TIMETABLE_LOADED = true;
							localStorage.setItem('IS_TIMETABLE_LOADED', true);
							$('.preloader').addClass('preloader_invis');
							$('.contact').addClass('contact_visible');
							// console.log(IS_TIMETABLE_LOADED);
						});
					}

				});
			}
		}
	});

	function showResult(){
		$('.information').css('display', 'flex');
		$('.weekdays').css('display', 'block');
		anime({
			targets: ['.weekdays', '.information'],
			duration: 200, 
			opacity: 1,
			scale: 1,
			easing: 'easeInOutQuad',
		});
	}

	function showResult2(){
		$('.information').css('display', 'flex');
		$('.weekdays').css('display', 'block');
		$('.information').css('transform', 'translateY(0px)');
		$('.weekdays').css('transform', 'translateY(0px)');
		anime({
			targets: ['.weekdays', '.information'],
			duration: 400, 
			opacity: 1,
			easing: 'easeInOutQuad',
		});
	}

	main_input.click(function(){

		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				let main_input_position = main_input.offset().top;
				let top_position = $('.headSection').offset().bottom;
				$(document).scrollTop(main_input_position - 10);
			}
	});

	// скрыть по нажатию на ESCAPE
	$(document).keyup(function(eventObject){
		if(eventObject.which == 27){
			main_input.blur();
			hideSuggestionBySuggestClick();
			suggest.filter('.suggest_hovered').removeClass('suggest_hovered');
		};
	});

	// main_input.on('blur', function(){
	// 	hideSuggestionBySuggestClick();
	// 	suggest.filter('.suggest_hovered').removeClass('suggest_hovered');
	// });

	$(document).click(function(event) {
		if ($(event.target).closest('.suggestion').length) return;
		suggestion.removeClass('suggestion_visible');
		suggestion_active = false;
		event.stopPropagation();
	});

	// $(document).click(function(){
	// 	if 
	// 	hideSuggestionBySuggestClick();
	// 	suggest.filter('.suggest_hovered').removeClass('suggest_hovered');
	// });




	// РАБОТА С ВРЕМЕНЕМ


	function getCurrentSubject(){
		let now = new Date().getTime();
		let now2 = new Date();

		let one_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 8, 30).getTime();
		let two_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 10, 15).getTime();
		let three_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 12).getTime();
		let four_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 14, 10).getTime();
		let five_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 15, 55).getTime();
		let six_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 17, 40).getTime();
		let seven_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 19, 25).getTime();

		// let one_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 8, 30).getTime();
		// let two_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 10, 5).getTime();
		// let three_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 11, 50).getTime();
		// let four_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 13, 35).getTime();
		// let five_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 15, 45).getTime();
		// let six_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 17, 30).getTime();
		// let seven_start = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 19, 15).getTime();

		let one_end = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 10, 5).getTime();
		let two_end = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 11, 50).getTime();
		let three_end = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 13, 35).getTime();
		let four_end = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 15, 45).getTime();
		let five_end = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 17, 30).getTime();
		let six_end = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 19, 15).getTime();
		let seven_end = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), 21).getTime();

		// else if (now < one_start && now < one_end) return ["nothing", "10:05"];
		// else if (now < two_start && now > one_end) return ["pause", "11:50", "12:00"];
		// else if (now < three_start && now > two_end) return ["pause", "13:35", "14:10"];
		// else if (now < four_start && now > three_end) return ["pause", "15:45", "15:55"];
		// else if (now < five_start && now > four_end) return ["pause", "17:30", "17:40"];
		// else if (now < six_start && now > five_end) return ["pause", "19:15", "19:25"];
		// else if (now < seven_start && now > six_end) return ["pause", "21:00"];
		// else if (now > seven_end) return ["nothing", "08:30"];

		if (now > one_start && now < one_end) return ["sub", "10:05"];
		else if (now > two_start && now < two_end) return ["sub", "11:50"];
		else if (now > three_start && now < three_end) return ["sub", "13:35"];
		else if (now > four_start && now < four_end) return ["sub", "15:45"];
		else if (now > five_start && now < five_end) return ["sub", "17:30"];
		else if (now > six_start && now < six_end) return ["sub", "19:15"];
		else if (now > seven_start && now < seven_end) return ["sub", "21:00"];
		
		else if (now < one_start && now < one_end) return ["nothing", "08:30"];
		else if (now < two_start && now > one_end) return ["pause", "11:50", "10:15"];
		else if (now < three_start && now > two_end) return ["pause", "13:35", "12:00"];
		else if (now < four_start && now > three_end) return ["pause", "15:45", "14:10"];
		else if (now < five_start && now > four_end) return ["pause", "17:30", "15:55"];
		else if (now < six_start && now > five_end) return ["pause", "19:15", "17:40"];
		else if (now < seven_start && now > six_end) return ["pause", "21:00", "end"];
		else if (now > seven_end) return ["nothing", "08:30"];

		else return "0";

		// let subject_starts = ['08:30', '10:15', '12:00', '14:10', '15:55', '17:40', '19:25'];
		// let subject_ends = ['10:05', '11:50', '13:35', '15:45', '17:30', '19:15', '21:00'];
	}

	// чётная/нечётная неделя (наоборот)
	function getWeekNum(day, month, year){
		month++;
		var a = Math.floor((14-month) / 12);
		var y = year + 4800 - a;
		var m = month + 12 * a - 3;
		var J = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y/4) - 
		Math.floor(y/100) + Math.floor(y/400) - 32045;
		d4 = (((J + 31741 - (J % 7)) % 146097) % 36524) % 1461;
		var L = Math.floor(d4 / 1460);
		var d1 = ((d4 - L) % 365) + L;
		var week = Math.floor(d1/7) + 1;
		if (week < 10) week='0'+week; // Лидирующий ноль для недель 1-9

		if (week % 2 == 0) return 1; 
		else return 2; 
	}

	function deleteCurrentSub(){
		$('.next').css('display', 'none');
	}

	function setCurrentSub(sub){

		let type;
		if (sub.type != ''){
			$('.next_sub_type-mobile').html(sub.type.toUpperCase());
			type = '<span class="next_sub_type next_sub_type-novisible">' + sub.type.toUpperCase() + '</span>';
		}

		else
			$('.next_sub_type-mobile').css('display', 'none');

		if (type != undefined)
			$('.next_sub').html(sub.subject + type);
		else
			$('.next_sub').html(sub.subject);

		$('.next_time').html(sub.time);

		if (sub.place == '' && sub.teacher == ''){
			$('.circle').hide();
			$('.next_place').hide();
			$('.next_teacher').hide();
		}

		else {
			$('.circle').show();
			$('.next_place').show();
			$('.next_teacher').show();
			$('.next_place').html(sub.place);
			$('.next_teacher').html(sub.teacher);
			// console.log(5);
		}

		$('.next').css('display', 'block');
		// anime({
		// 	targets: ['.next'],
		// 	duration: 200, 
		// 	opacity: 1,
		// 	scale: 1,
		// 	easing: 'easeInOutQuad',
		// });
	}

	function TimeOverInit(end_time){
		let now = new Date();
		let hour = parseInt(end_time.substr(0, 2));
		let minutes = parseInt(end_time.substr(3, 2));
		let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minutes).getTime();
		// console.log(Math.floor((end - now2)/(1000 * 60)));

		TimeOverGo(end);
	}

	function TimeOverGo(end){
		let now2 = new Date().getTime();
		let diff = Math.floor((end - now2)/(1000 * 60));
		let str_min;
		console.log('Время идет ' + diff);
		if (diff > 60 && diff < 83){
			// console.log('1 час ' + diff);
			let min = diff - 60;
			str_min = getEndWordMinutes(min);
			$('.next_label_time').html('остался 1 ч. ' + min + ' ' + str_min);
		}

		else if (diff <= 95 && diff >= 90){
			// console.log('2 часа ' + diff);
			$('.next_label_time').html('только началось');
		}

		else if (diff < 90 && diff >= 85){
			// console.log('5 минут ' + diff);
			$('.next_label_time').html('началось 5 мин. назад');
		}

		else if (diff < 85 && diff >= 80){
			$('.next_label_time').html('началось 10 мин. назад');
		}

		else if (diff < 60){
			str_min = getEndWordMinutes(diff);
			let diff_str = diff.toString();
			// console.log(diff_str[diff_str.length - 1] + ' 1 минута');
			if (diff_str[diff_str.length - 1] == 1 && diff_str != 11){
				$('.next_label_time').html('осталась ' + diff + ' ' + str_min);
			}
			else if(diff_str == 11){
				$('.next_label_time').html('осталось ' + diff + ' ' + str_min);
			}
			else{
				// console.log('осталось');
				$('.next_label_time').html('осталось ' + diff + ' ' + str_min);
			}
		}

		if (diff == 0 || diff > 95){
			// console.log('Больше 1.20' + diff);
			$('.next').css('display', 'none');
			console.log('Предмет закончился');
			return;
		}
		else if (diff > 0){
			setInterval(TimeOverGo, 60000, end);
		}
	}

	function getEndWordMinutes(min){
		min = min.toString();
		console.log(min.length + ' ' + min[min.length - 1]);
		if (min == 11)
			return 'минут'
		else if (min == 1 || min[min.length - 1] == 1)
			return 'минута'
		else if (min == 2 || min == 3 || min == 4 || 
			(min[min.length - 1] == 2 && min[min.length - 2] != 1) ||
			(min[min.length - 1] == 3 && min[min.length - 2] != 1) ||
			(min[min.length - 1] == 4 && min[min.length - 2] != 1))
			return 'минуты'

		else if ((min.length == 2 || min.length == 3) && (min[min.length - 2] == 1) && (min[min.length - 1] == 1 ||
			min[min.length - 1] == 2 ||
			min[min.length - 1] == 3 ||
			min[min.length - 1] == 4))
			return 'минут'

		else
			return 'минут'
	}

	let subject_starts = ['08:30', '10:15', '12:00', '14:10', '15:55', '17:40', '19:25'];
	let subject_ends = ['10:05', '11:50', '13:35', '15:45', '17:30', '19:15', '21:00'];

	function getSubStartTimeNext(end_time_previous){
		for (let index = 0; index < subject_starts.length; index++) {
			if (end_time_previous == subject_ends[index]){
				return subject_starts[index + 1];
			}

			else return "0";
		}
	}

	function getSubTodayNew(){
		// let end_time = getCurrentSubject();
		let sub_today = getCurrentSubject();
		let end_time = sub_today[1];
		console.log('проверка предмета ' + sub_today[0]);
		if (end_time != "0" && sub_today[0] == "sub"){
			$('.today__content_today').each(function(){
				if ($(this).attr('data-time') == undefined){
					return;
				}
				if ($(this).attr('data-time').substr(6, 5) == end_time){
					$(this).addClass('today__content_goes');
					$(this).find('.today__content-subject-middle').append('<div class="today__content-subject-remaining">осталось 42 мин.</div>');
					let next_subject_time_starts = getSubStartTimeNext(end_time);
					console.log('следующий предмет будет: ', next_subject_time_starts);
					TimeOverInitNew(end_time, $(this), next_subject_time_starts);
					console.log('Пара нашлась');
				}
			});
		}

		else if (end_time != "0" && sub_today[0] == "pause"){
			$('.today__content_today').each(function(){
				if ($(this).attr('data-time') == undefined){
					return;
				}
				if ($(this).attr('data-time').substr(6, 5) == end_time){
					$(this).addClass('today__content_starts');
					$(this).find('.today__content-subject-middle').append('<div class="today__content-subject-starts">начнётся через 42 мин.</div>');
					PauseTimeOverInitNew(end_time, $(this), sub_today[2]);
					console.log('Перемена нашлась');
				}
			});
		}
	}

	var subGoesInterval;
	var subEndsTimeout;

	var pauseGoesInterval;
	var pauseEndsTimeout;

	function PauseTimeOverInitNew(end_time, subject, pause_end){
		console.log(pause_end + ' конец перемены');
		let now = new Date();
		let nowTimeStamp = new Date().getTime();
		let hour = parseInt(pause_end.substr(0, 2));
		let minutes = parseInt(pause_end.substr(3, 2));
		let pause_end_obj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minutes).getTime();
		console.log(Math.floor((pause_end_obj - nowTimeStamp)/60000));

		// let diff2;
		
		
		let diffPauseEnd = pause_end_obj - nowTimeStamp;
		// diff2 = next_subject_time - end;

		PauseTimeOverGoNew(pause_end_obj);
		pauseGoesInterval = setInterval(PauseTimeOverGoNew, 60000, pause_end_obj);
		pasueEndsTimeout = setTimeout(function(){
			clearInterval(pauseGoesInterval);
			console.log('перемена закончилась');
			subject.removeClass('today__content_starts');
			$('.today__content-subject-starts').remove();
			getSubTodayNew();

		}, diffPauseEnd);

	}

	function PauseTimeOverGoNew(end, subject){
		let now2 = new Date().getTime();
		let diff = Math.floor((end - now2)/(1000 * 60));
		console.log('начнется через '+ diff);

		if (diff == 1 || diff == 21 || diff == 31){
			console.log('1');
			if(diff == 1){
				$('.today__content-subject-starts').html('начнётся через 1 минуту');
			}

			else if(diff == 21){
				$('.today__content-subject-starts').html('начнётся через 21 минуту');
			}

			else if(diff == 31){
				$('.today__content-subject-starts').html('начнётся через 31 минуту');
			}
		}

		else if (diff == 4 || diff == 24 || diff == 34){
			console.log('4');
			if(diff == 4){
				$('.today__content-subject-starts').html('начнётся через 4 минуты');
			}

			else if(diff == 24){
				$('.today__content-subject-starts').html('начнётся через 24 минуты');
			}

			else if(diff == 34){
				$('.today__content-subject-starts').html('начнётся через 34 минуты');
			}
		}

		else if (diff == 3 || diff == 23 || diff == 33){
			console.log('3');
			if(diff == 3){
				$('.today__content-subject-starts').html('начнётся через 3 минуты');
			}

			else if(diff == 23){
				$('.today__content-subject-starts').html('начнётся через 23 минуты');
			}

			else if(diff == 33){
				$('.today__content-subject-starts').html('начнётся через 33 минуты');
			}
		}

		else if (diff == 2 || diff == 22 || diff == 32){
			console.log('2');
			if(diff == 2){
				$('.today__content-subject-starts').html('начнётся через 2 минуты');
			}

			else if(diff == 22){
				$('.today__content-subject-starts').html('начнётся через 22 минуты');
			}

			else if(diff == 32){
				$('.today__content-subject-starts').html('начнётся через 32 минуты');
			}
		}

		else if(diff == 0){
			console.log('0');
			$('.today__content-subject-starts').html('только началось');
		}

		else if (diff > 0 && diff < 36){
			console.log('>0');
			$('.today__content-subject-starts').html('начнётся через '+ diff +' минут');
		}
	}

	function TimeOverInitNew(end_time, subject, next_subject_time_starts){
		let now = new Date();
		let now2 = new Date().getTime();
		let hour = parseInt(end_time.substr(0, 2));
		let minutes = parseInt(end_time.substr(3, 2));
		let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minutes).getTime();

		let WillNextSub = false;
		let hour_next_subject;
		let minutes_next_subject;
		let next_subject_time;
		let diff2;

		if (next_subject_time_starts != "0"){
			hour_next_subject = parseInt(next_subject_time_starts.substr(0, 2));
			minutes_next_subject = parseInt(next_subject_time_starts.substr(3, 2));
			next_subject_time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour_next_subject, minutes_next_subject).getTime();
			WillNextSub = true;
		}
		
		
		let diff = end - now2;
		diff2 = next_subject_time - end;

		// console.log(diff + ' время до конца пары');
		// console.log('до начала пары следующ ' + Math.floor(diff2/(1000 * 60)));

		TimeOverGoNew(end);
		subGoesInterval = setInterval(TimeOverGoNew, 60000, end);
		subEndsTimeout = setTimeout(function(){
			clearInterval(subGoesInterval);
			console.log('пара закончилась');
			subject.removeClass('today__content_goes');
			$('.today__content-subject-remaining').remove();

			if (WillNextSub){

				getSubTodayNew();

				console.log('Следующий предмет будет');
				setTimeout(function(){
					// console.log('запускаем следующий предмет ' + Math.floor(diff2/(1000 * 60)));
					getSubTodayNew();
				}, diff2);
			}

			else console.log('Следующего предмета не будет');


		}, diff);

	}

	function TimeOverGoNew(end, subject){
		let now2 = new Date().getTime();
		let diff = Math.floor((end - now2)/(1000 * 60));
		let str_min;
		// let interval = setInterval(TimeOverGoNew, 60000, end);
		// console.log('Новое время идет ' + diff);
		if (diff > 60 && diff < 83){
			// console.log('1 час ' + diff);
			let min = diff - 60;
			str_min = getEndWordMinutes(min);
			$('.today__content-subject-remaining').html('остался 1 ч ' + min + ' ' + str_min);
		}

		else if (diff <= 95 && diff >= 90){
			// console.log('2 часа ' + diff);
			$('.today__content-subject-remaining').html('только началось');
		}

		else if (diff < 90 && diff >= 85){
			// console.log('5 минут ' + diff);
			$('.today__content-subject-remaining').html('началось 5 мин назад');
		}

		else if (diff < 85 && diff >= 80){
			$('.today__content-subject-remaining').html('началось 10 мин назад');
		}

		else if (diff == 0){
			$('.today__content-subject-remaining').html('только что закончилось');
		}

		else if (diff < 60){
			str_min = getEndWordMinutes(diff);
			let diff_str = diff.toString();
			// console.log(diff_str[diff_str.length - 1] + ' 1 минута');
			if (diff_str[diff_str.length - 1] == 1 && diff_str != 11){
				$('.today__content-subject-remaining').html('осталась ' + diff + ' ' + str_min);
			}
			else if(diff_str == 11){
				$('.today__content-subject-remaining').html('осталось ' + diff + ' ' + str_min);
			}
			else{
				// console.log('осталось');
				$('.today__content-subject-remaining').html('осталось ' + diff + ' ' + str_min);
			}
		}

		// if (diff == 0 || diff > 95 || diff < 0){
		// 	// console.log('Больше 1.20' + diff);

		// 	$('.today__content_goes').find('.today__content-subject-middle').children('.today__content-subject-remaining').remove();
		// 	$('.today__content_goes').removeClass('today__content_goes');
		// 	clearInterval(para);
		
		// 	// getSubTodayNewInterval = setInterval(getSubTodayNew, 300000);
		// 	console.log('Предмет закончился');
		// 	return;
		// }
		// else if (diff > 0){
		// 	interval = setInterval(TimeOverGoNew, 60000, end);
		// }
	}

	function getSubToday(){
		let end_time = getCurrentSubject();
		// console.log(end_time + ' окончательное время');
		if (end_time != "0"){
			$.getJSON(BASE_API_URL + $('.main-input').val().toLowerCase(), function(data) {

				let date = new Date();
				let currentDay = date.getDay();
				let currentWeek = getWeekNum(date.getDate(), date.getMonth(), date.getFullYear());
				let sub;

				for (var i = data.timetable.length - 1; i >= 0; i--) {
					if (data.timetable[i].day == currentDay && data.timetable[i].week == currentWeek
						&& data.timetable[i].time.substr(6, 5) == end_time){
						sub = data.timetable[i];
					}
				}

				if (sub){
					setCurrentSub(sub);
					TimeOverInit(end_time);
				}

				else{
					deleteCurrentSub();
					console.log('Нет текущего предмета');
				}

			});
		}
	}

	function repaint(){
		// console.log('Работает3');
		var inst = localStorage.getItem('inst');

		$('.preloader').removeClass('preloader_invis');
		// window.history.pushState({'name' : localStorage.getItem('group')}, null, null);

		anime({
			targets: ['.weekdays', '.information'],
			duration: 200, 
			opacity: 0,
			scale: 0.99,
			easing: 'easeInOutQuad',
			complete: function(){
				$('.preloader').removeClass('preloader_invis');
				// window.history.pushState({'name' : nameForHistory}, null, null);
				makeTimetable(function(){
					// console.log('Работает');
					setInformation(inst);
					showResult2();
					// getSubToday();
					getSubTodayNew();
					IS_TIMETABLE_LOADED = true;
					// localStorage.setItem('IS_TIMETABLE_LOADED', true);
					// console.log(IS_TIMETABLE_LOADED);
					$('.preloader').addClass('preloader_invis');
					$('.contact').addClass('contact_visible');
				});
			}
		});
	}	
});


