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
	 move_down = false, //индикатор движения
	 event_end_of_movement = false; //глобальная переменная состояния  для проверки сработала ли функция по укладке объекта

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

		$("#left").click(function() { if (move_down) direct('left',z_object); }); //move_down проверяет в процессе ли движение игры
		$("#right").click(function() { if (move_down) direct('right',z_object); }); //move_down проверяет в процессе ли движение игры
		$("#flip").click(function() { if (move_down) rotate_index = rotater(z_object,rotate_index); }); //move_down проверяет в процессе ли движение игры
		$("#down").click(function() {	if (move_down) for (i=0;i<6;i++) direct('down',z_object); }); //move_down проверяет в процессе ли движение игры
		$("#super_down").click(function() {	if (move_down) mega_fast_down(); }); //move_down проверяет в процессе ли движение игры

	//считывание клавиатуры
	window.addEventListener('keydown', function(e)
	{
		if (move_down) //блокировка кнопок при отсутствии автоматического движения вниз (паузе)
		{
			if (e.key == 'ArrowLeft') direct('left',z_object);//налево
			if (e.key == 'ArrowRight') direct('right',z_object);//направо
			if (e.key == 'ArrowUp') rotate_index = rotater(z_object,rotate_index); //кнопка поворота объекта
			if (e.key == 'ArrowDown') for (i=0;i<5;i++) direct('down',z_object);//кнопка ускорения
			if (e.key == ' ') mega_fast_down();//кнопка максимального ускорения
		}

		if (e.key == 'Escape') pause(zero_line_overflow()); //пауза
	});

});
///////////////////////////////////////////////////

//////////////ФУНКЦИИ ЗАПУСКА/ПАУЗЫ ИГРЫ////////////////////////////

//функция для зачистки пространства перед новой игрой и нового/первого запуска
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
function pause(overflow)//overflow логическая функция для проверки конца игры передаётся в паузу
	{
		if (move_down)
		{
			move_down = false;
			clearInterval(timer);//сброс запущеной функции таймера
			$('.dot').css('opacity','0.2');//"затемнение" на паузе
			$('body').css('backgroundColor','rgb(25, 82, 138)');// восстановление цвета заднего фона
		}
		else if ((onoff) && !(overflow)) //если конец игры, то с паузы не снимается
		{
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

		title = String(score_in).padStart(3,'0');
		for (var i = 0; i < title.length; i++)
			$($(".dot").get(58+i-title.length+1)).html(title[i]);
	}

//функция автозапуска падения блоков
function auto_down(speed_in_function) {
	timer = setInterval("direct('down', z_object)", speed_in_function);
	return true;
}

//функция мега-быстрого спуска объекта
function mega_fast_down()
{
	event_end_of_movement=false; //глобальная переменная, меняющая значение в функции end_of_movement
	do
		direct('down',z_object);
	while (!event_end_of_movement);
}

/////////////БЛОК CМЕНЫ ЦВЕТОВ////////////////////
//функция смены цвета для риования препятствий мышью
	function colorSwitch(object)
	{
		var color = ($(object).css('backgroundColor') == color_dark) ? color_light: color_dark; //toggle цвета
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
var previous_figure_index;//для передачи значения предыдущего объекта
var previous_figure_rotate_index = 0;//для передачи значения предыдущего объекта
function active_z()
{
	previous_figure_index = figure_index; //костыль для rotatera по пердаче объекта из предпросмотра в актив
	rotate_index = previous_figure_rotate_index; //костыль для rotatera по передаче положения фигуры уже повёрнутой в предпросмотре 

	for (var i=0; i < 4; i++)//присвоение активному объекту значения буферной переменной учавствовавшей в предпросмотре
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
	var rand = Math.floor((Math.random()*5));//случайное количество исполнений положения поворота

	for (var i=0; i < rand; i++)//реализация поворота фигуры внутри интерфейса на случайное количество
		{
			previous_figure_rotate_index = (previous_figure_rotate_index !== 3) ? ++previous_figure_rotate_index : 0;//карусель 0-1-2-3
			for (var j=0; j <4; j++) //сам поворот фигуры
				figure[figure_index][j] += figure_rotater[figure_index][previous_figure_rotate_index][j];
		}
	//прорисовка следующей фигуры
	for (var i=0; i < 4; i++)
		colored($(".dot").get(figure[figure_index][i]+(colrow*7)+10), color_light);
}

///////////////////функция проверки на столкновение с объектами///////////
function way_free(what, move_it)
{
	var free_spaces = true; //переменная свободного пространства
		for (var i=0; i < 4; i++)
		{
			free_spaces = ((what[i] + move_it[i]) % 20 - 19 == 0 ) ? false : free_spaces; //CТЕНА СЛЕВА
			free_spaces = ($($(".dot").get(what[i] + move_it[i])).attr("class") == 'dot wall') ? false : free_spaces; //твёрдый объект .wall рядом
			free_spaces = (what[i] + move_it[i] > 399 ) ? false : free_spaces;//ПОЛ СНИЗУ
			free_spaces = (what[i]+ move_it[i] < 1 ) ? false : free_spaces;//прoверка для корректировки положения проявленой фигуры
		}//если хоть в одной проверке вышло false, то она останется в переменной free_spaces
	return free_spaces; 
}

//////////// //функция запуска событий после "укладки" объекта // ///////////////////////////
function end_of_movement(what)
{
	//сначала проверяем game_over
	if (zero_line_overflow())//запускаем фунцию проверки заполненности последней строки, которая возвращает булевское значение
	{
		pause(zero_line_overflow());//постановка на паузу без вожможности снять с неё
		alert("GAME OVER! \n You`re score is "+score+" lines.");
	}

	for (var i=0; i < 4; i++) //объект превращается в wall, становится материалом, препятствием
		$($(".dot").get(what[i])).toggleClass('wall',true);

	line_control();//запуск считывания линий
	event_end_of_movement = true; //функция сработала!
	active_z(); //активация нового объекта
}


///////////////--Поворот объекта--//////////////////////////
	function rotater(what_rotate, rotate_index_in)
	{
		//зацикливание индекса поворота 1-2-3-0 //и смена его значения на ++
		rotate_index_in = (rotate_index_in !== 3) ? ++rotate_index_in : 0;

		var move_it_array = figure_rotater[previous_figure_index][rotate_index_in];//уменьшение размера описания переменной

		if (way_free(what_rotate,move_it_array))//запуск логической функции на свободное пространство для маневра
		{
			for (var i=0; i < 4; i++)
			{	//зачистка пространства
				colored($(".dot").get(what_rotate[i]), color_dark);
				//смена значений для поворота
				what_rotate[i] += move_it_array[i];
			}

			for (var i=0; i < 4 ; i++)	//пересоздание объекта по новым адресатам
				colored($(".dot").get(what_rotate[i]), color_light);
		}
		else //если препятствие, то индекс минусуется
		{
			rotate_index_in = (rotate_index_in !== 0) ? --rotate_index_in : 3;
		}

		return rotate_index_in;
	}

////////////////--Перемещение объектов--///////////////////////////////
	function direct(to, what)
	{
		var move_it =  (to == 'down') ? colrow : //значение смещения вниз
					(to == 'up') ? -colrow : //значение смещения вверх (для корректировки появляющихся фигур)
					(to == 'left') ? -1 : 1; //либо налево/направо
		//адаптация перемещения в массив для функции проверки препятствий
		var move_it_array=[move_it,move_it,move_it,move_it];

		//если препятствие, то значение перемещения обнуляется
		if (!way_free(what,move_it_array)) move_it_array =[0,0,0,0];

		//стирание объекта
		for (var i=0; i < 4; i++)
		{
			colored($(".dot").get(what[i]), color_dark);
		}
		//прорисовка объекта
		for (var i=0; i < 4; i++)
		{
			what[i]+=move_it_array[i]; //само перемещение
			colored($(".dot").get(what[i]), color_light);
		}
		//передача управления новому объекту при окончательном падении активного
		if ((move_it_array[0] == 0) && to == 'down') //если сработало обнуление массива при передвижении вниз

			end_of_movement(what); //то запускается функция обработки конца движения объекта

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