var color_light = 'rgb(200, 120, 0)',
	 color_dark = 'rgb(10, 50, 130)',
	 colrow = 20, //количество строк/столбцов в активной зоне
	 rotate_index = 0;//коэффициент итерации поворота объекта //не изменять!
	 speed = 850, //скорость падения фигур
	 timer = true, //глобально для прекращения цикла
	 lines = [], //массив для контроля строк
	 score = 0,//переменная количества собранных линий
	 figure_index = 0, //активация переменной индекса рандомного объекта
	 z_object = [0,0,0,0], //активация массива активной фигуры
	 onoff = false, //переменная состояния отмены включения паузы до начала игры
	 move_down = false; //индикатор движения

//базовые данные фигур
var figure_constant = [
								[4,5,24,25], //квадрат
								[23,24,25,26], //линия
								[4,5,25,26], //Z
								[4,5,23,24], //Z - зеркальная
								[4,24,25,26], //Г
								[6,24,25,26], //Г зеркальная
								[5,24,25,26] //четвёрка _~_
							];

//операбельные данные фигур
var 			figure = [
								[4,5,24,25],
								[23,24,25,26],
								[4,5,25,26],
								[4,5,23,24],
								[4,24,25,26],
								[6,24,25,26],
								[5,24,25,26]
							];

//массив для поворота объектов
var figure_rotater = [
//0
			[ [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ], //квадрат
//1
			[ [18,-1,-20,-39], [-18,1,20,39], [18,-1,-20,-39], [-18,1,20,39] ], //линия
//2
			[ [-1,-19,0,-18], [1,19,0,18], [-1,-19,0,-18], [1,19,0,18] ], //Z
//3
			[ [0,-19,-2,-21], [0,19,2,21], [0,-19,-2,-21], [0,19,2,21] ], //Z зеркльная
//4
			[ [-1,-1,-20,-18], [1,-18,0,19], [19,19,1,1], [-19,0,19,-2] ], //Г
//5
			[ [2,19,0,-19], [-1,1,20,20], [19,0,-19,-2], [-20,-20,-1,1] ], //Г зеркальная
//6
			[ [0,0,0,-19], [0,1,1,19], [19,0,0,0], [-19,-1,-1,0] ] //четвёрка _~_
		];

//обновление данных о начальном положении фигур
function fig_const()
{
	for (var i=0; i < figure_constant.length; i++)
		for (var j=0; j < figure_constant[i].length; j++)
			figure[i][j] = figure_constant[i][j];
}

//создание массива данных контрольной области для проверки линий
//clear отвечает за функцию очистки при новом старте программы
function line_control_array(clear)
	{
		for (var i = 0; i < colrow; i++)
		{
			lines[i]= new Array();
			for (var j = 0; j < 10; j++)
			{
				lines[i][j]= j+i*(colrow);

				if (clear) //функция зачистки
				{
					$($(".dot").get(lines[i][j])).toggleClass('wall',false);//стираем значения 'wall'
					colored($(".dot").get(lines[i][j]), color_dark);//перекрашивание поля в цвет фона
				}
			}
		}
	}

//создание массива данных для зачистки окна со следующей фигурой
function interface_next_figure()
	{
		for (var i = 7; i < 11; i++)
			for (var j = 12; j < 19; j++)
				colored($(".dot").get(j+i*colrow), color_dark);//перекрашивание поля в цвет фона
	}


///////////////////ИСПОЛНИТЕЛЬНЫЙ БЛОК///////////////////////////////
$(document).ready(function() {

	line_control_array(); //создание массива line
	interface_next_figure(); //создание массива для зачистки поля вывода следующей фигуры

	// $(".dot").bind({ //рисование на поле
	// 	mouseenter: function() {colorSwitch(this)}
	// });

	//запуск игры
	$("#start").click(function() { new_game(); });
	//пауза
	$("#pause").click(function(){ pause(zero_line_overflow()); }); //overflow для того чтобы пауза не отжималась по окончании игры

		$("#left").click(function() { if (move_down) direct('left',z_object); });
		$("#right").click(function() { if (move_down) direct('right',z_object); });
		$("#flip").click(function() { if (move_down) rotater(z_object); });
		$("#down").click(function() { if (move_down) for (i=0;i<3;i++) direct('down',z_object); });

	//считывание клавиатуры
	window.addEventListener('keydown', function(e)
	{
		if (move_down) //блокировка кнопок при паузе
		{
			if (e.key == 'ArrowLeft') direct('left',z_object);//налево
			if (e.key == 'ArrowRight') direct('right',z_object);//направо
			if (e.key == 'ArrowUp') rotater(z_object); //кнопка поворота объекта
			if (e.key == 'ArrowDown') for (i=0;i<2;i++) direct('down',z_object); //кнопка ускорения
		}

		if (e.key == 'Escape') pause(zero_line_overflow()); //пауза
	});

});
///////////////////////////////////////////////////

//////////////ФУНКЦИИ ЗАПУСКА/ПАУЗЫ ИГРЫ////////////////////////////
//функция для зачистки пространства перед новой игрой
function new_game()
	{
		onoff = true;//показываем что new_game в деле
		$('body').css('backgroundColor','black');//затемнение остального пространства
		$('.dot').css('opacity','1');//возврат к нормальному виду если была пауза
		line_control_array(true);//зачищаем основное пространство
		score = 0;//зачистка количества очков
		line_counter_display(score);//вывод очков
		active_z();//активация первой фигуры
		clearInterval(timer);//сброс таймера движения
		move_down = auto_down(speed); //активация движения
	}

//функция паузы
function pause(overflow)
	{
		if (move_down)
		{
			move_down = false;
			clearInterval(timer);
			$('.dot').css('opacity','0.2');//"затемнение" на паузе
			$('body').css('backgroundColor','rgb(25, 82, 138)');// восстановление цвета заднего фона
		}
		else if ((onoff) && !(overflow)) //если конец игры, то с паузы не снимается
		{
			console.log("else!");
			clearInterval(timer);
			move_down = auto_down(speed); //true
			$('.dot').css('opacity','1');//возврат к нормальному виду
			$('body').css('backgroundColor','black');// затемнение цвета заднего фона
		}
	}

//функция вывода количества собранных линий

function line_counter_display(score_in)
	{
		var title='LINES';
		for (var i = 0; i < title.length; i++)
			$($(".dot").get(i+32)).html(title[i]);

		title = String(score_in);
		for (var i = 0; i < title.length; i++)
			$($(".dot").get(58+i-title.length+1)).html(title[i]);
	}

//функция автозапуска падения блоков

function auto_down(speed_in_function) {
	timer = setInterval("direct('down', z_object)", speed_in_function);
	return true;
}

/////////////БЛОК CМЕНЫ ЦВЕТОВ////////////////////
//функция смены цвета
	function colorSwitch(object)
	{
		var color = ($(object).css('backgroundColor') == color_dark) ? color_light: color_dark;
		$(object).toggleClass('wall');
		colored(object,color);
	}
//функция окрашивания
	function colored(object,color)
	{
		$(object).css('backgroundColor',color);
	}


/////////////БЛОК ПОВЕДЕНИЯ ОБЪЕКТОВ////////////////////////////////

/////активация нового объекта///////
figure_index = Math.floor((Math.random()*figure.length));//случайный индекс объекта
var previous_figure_index;
var previous_figure_rotate_index = 0;
function active_z()
{	
	previous_figure_index = figure_index; //костыль для rotatera по пердаче объекта
	rotate_index = previous_figure_rotate_index; //костыль для rotatera по передаче положения при повороте
	for (var i=0; i < 4; i++)//присвоение активному объекту значения буферной переменной
		z_object[i] = figure[figure_index][i];
	//прорисовка объекта
	for (var i=0; i < 4; i++)
		colored($(".dot").get(z_object[i]), color_light);

	//поднятие фигуры, если она отрисовалась при повороте ниже
	direct('up',z_object);

	//зачистка пространства в интерфейсе следующей фигуры
	interface_next_figure();

	//случайный индекс для следующей фигуры
	figure_index = Math.floor((Math.random()*figure.length));
	fig_const(); //перезаливка промежуточного массива объектов

	//поворот изначального состояния следующего объекта
	previous_figure_rotate_index = 0;//обнуление поворота
	var rand = Math.floor((Math.random()*5));//случайное положение поворота
	for (var i=0; i < rand; i++)
		{
			previous_figure_rotate_index = (previous_figure_rotate_index !== 3) ? ++previous_figure_rotate_index : 0;
			for (var ii=0; ii <4; ii++)
				figure[figure_index][ii] += figure_rotater[figure_index][previous_figure_rotate_index][ii];
		}
	//прорисовка справа следующей фигуры
	for (var i=0; i < 4; i++)
		colored($(".dot").get(figure[figure_index][i]+(colrow*7)+10), color_light);
}

///////////////--Поворот объекта--//////////////////////////
	function rotater(what_rotate)
	{
		//зацикливание индекса поворота 1-2-3-0 //и смена его значения на ++
		rotate_index = (rotate_index !== 3) ? ++rotate_index : 0;
		var turn = figure_rotater[previous_figure_index][rotate_index];//уменьшение размера переменной

		//проверка на столкновение с препятствиями
		var min_left = 1,	min = 1,	min_bottom = 1;
		for (var i=0; i < 4; i++)
		{
			min_left = ((what_rotate[i] + turn[i]) % 20 - 19 == 0 ) ? 0 : min_left; //CТЕНА СЛЕВА
			min = ($($(".dot").get(what_rotate[i] + turn[i])).attr("class") == 'dot wall') ? 0 : min; //твёрдый объект .wall рядом
			min_bottom = (what_rotate[i] + turn[i] > 399 ) ? 0 : min_bottom;//ПОЛ СНИЗУ
		}

		if ((min_left !== 0) && (min !== 0) && (min_bottom !== 0))
		{
			for (var i=0; i < 4; i++)
			{
				//зачистка пространства
				colored($(".dot").get(what_rotate[i]), color_dark);
				//смена значений для поворота
				what_rotate[i] += turn[i];
			}
			//пересоздание объекта по новым адресатам
			for (var i=0; i < 4 ; i++)
				colored($(".dot").get(what_rotate[i]), color_light);
		}
		else {rotate_index = (rotate_index !== 0) ? --rotate_index : 3;} //если препятствие, то индекс минусуется
	}

////////////////--Перемещение объектов--///////////////////////////////
	function direct(to, what)
	{
		var n =  (to == 'down') ? colrow : //значение смещения вниз
					(to == 'up') ? -colrow : //значение смещения вверх (для корректировки появляющихся фигур)
					(to == 'left') ? -1 : 1; //либо налево/направо

		//проверка на препятствия
		var min_left = 1,	min_wall = 1,	min_bottom = 1, min_up = 1;
		for (var i=0; i < 4; i++)
		{
		min_left = (what[i] % 20 == 0 ) ? 0 : min_left; //CТЕНА СЛЕВА
		min_wall = ($($(".dot").get(what[i]+n)).attr("class") == 'dot wall') ? 0 : min_wall; //твёрдый объект .wall рядом
		min_bottom = (what[i]+n > 399 ) ? 0 : min_bottom;//ПОЛ СНИЗУ
		min_up = (what[i]+n < 1 ) ? 0 : min_up;//прoверка для корректировки положения проявленой фигуры
		}

		//корректировка перемещения от препятствий
		if ((min_left == 0 || min_wall == 0) && to == 'left') ++n;
		if (min_wall == 0 && to == 'right') --n;
		if ((min_bottom == 0 || min_wall == 0) && to == 'down') n-=colrow;
		if (min_up == 0 && to == 'up') n+=colrow;
		
		//стирание объекта
		for (var i=0; i < 4; i++)
		{
			colored($(".dot").get(what[i]), color_dark);
		}
		//прорисовка объекта
		for (var i=0; i < 4; i++)
		{
			what[i]+=n; //само перемещение
			colored($(".dot").get(what[i]), color_light);
		}
		//передача управления новому объекту при окончательном падении активного
		if ((min_bottom == 0 || min_wall == 0) && to == 'down')
		{
			//сначала проверяем game_over
			if (zero_line_overflow())//запускаем фунцию проверки заполненности последней строки, которая возвращает булевское значение
			{
				pause(zero_line_overflow());//постановка на паузу без вожможности снять с неё
				alert("GAME OVER! \n You`re score is "+score+" lines.");
			}

			for (var i=0; i < 4; i++)
				$($(".dot").get(what[i])).toggleClass('wall',true);//объект превращается в wall

			line_control();//запуск считывания линий
			active_z(); //активация нового объекта
		}
}

///////////-ФУНКЦИИ МАНИПУЛЯЦИИ С ЛИНИЯМИ//////////////////

//проверка на сложенную линию
function line_control()
	{
		var line_complete; //определение переменной проверки линии
		for (var i=19; i > -1; i--)
		{
			line_complete = 0; //обнуление переменной на каждой строке
			for (var j=0; j < 10; j++)
			{//прибавление значения, если присутствует значение 'wall'
				line_complete = ($($(".dot").get(lines[i][j])).attr("class") == 'dot wall') ? ++line_complete : line_complete;
			}
			//если все десять значений в линии совпадают, то запускается событие перерисовки
			if (line_complete == 10)
			{
				for (var j=0; j < 10; j++) //убираем первую строку
				{
					colored($(".dot").get(lines[i][j]), color_dark);//анимация сокращения строки
					$($(".dot").get(lines[i][j])).toggleClass('wall',false);//убираем значение wall
				}
				score++;//прибавляем очко
				line_counter_display(score); //выводим значение собраных линий на экран

				var line_to_switch = new Array(),//объявление рабочего внутрициклового буферного массива
						line_i = 0; //индекс для этого же массива

				//считываем данные о состояни остальных "полос" в буферный массив
				//над (ii=i-1) убраной линией
				for (var ii=i-1; ii > -1; ii--)
					for (var j=0; j < 10; j++)
					{//присвоение значений классов в массив
						line_to_switch[line_i]=$($(".dot").get(lines[ii][j])).attr("class");
						line_i++; //добавление индекса массива
					}


				//зачищаем пространство над (ii=i-1) убраной линией
				for (var ii=i-1; ii > -1; ii--) 
				{
					for (var j=0; j < 10; j++)
					{
						$($(".dot").get(lines[ii][j])).toggleClass('wall',false);//стираем значения 'wall'
						colored($(".dot").get(lines[ii][j]), color_dark);//перекрашивание поля в цвет фона
					}
				}

				line_i=0; //обнуляем индекс массива с данными об остальных линиях
				//рисуем на row вниз (ii=i)
				for (var ii=i; ii > -1; ii--)
					for (var j=0; j < 10; j++)
					{	//присвоение значений классов из массива
						$($(".dot").get(lines[ii][j])).attr("class", line_to_switch[line_i]);
						//немедленная окраска значений 'dot wall'
						if (line_to_switch[line_i] == "dot wall")
							colored($(".dot").get(lines[ii][j]), color_light);
						line_i++;//переход на следующий индекс буферного массива
					}
				//повторная проверка с той же строки
				i++;//для считывания опустившегося вниз на одну строку материала
			}
		}
	}

//функция проверки условий окончания игры
function zero_line_overflow()
	{
		var zero = false;
		for (i=0; i <10; i++) //от 0 до 9 это индексы самой верхней строки
		zero = ($($(".dot").get(i)).attr('class') == 'dot wall') ? true : zero;
		return zero;
	}