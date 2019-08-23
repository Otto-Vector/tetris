var color_light = 'rgb(255, 255, 255)',
	 color_dark = 'rgb(0, 0, 255)',
	 leftright = 'scaleX(-1)',
	 updown = 'scaleY(-1)',
	 norm = 'scale(1,1)',
	 duration = '0.3s',//задержка анимации
	 colrow = 20, //количество строк/столбцов в активной зоне
	 rotate_index = 0;//коэффициент итерации поворота объекта //не изменять!
	 speed = 1000, //скорость падения фигур
	 timer = true, //глобально для прекращения цикла
	 lines = [], //массив для контроля строк
	 score = 0;//переменная количества собранных линий

//базовые данные
var figure_constant = [
								[4,5,24,25],
								[23,24,25,26],
								[3,4,24,25],
								[3,4,22,23],
								[5,5,5,5],
								[4,24,25,26],
								[6,24,25,26],
								[5,24,25,26]
							];

//операбельные данные
var 			figure = [
								[4,5,24,25],
								[23,24,25,26],
								[3,4,24,25],
								[3,4,22,23],
								[5,5,5,5],
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
			[ [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ], //точка
//5
			[ [-1,-1,-20,-18], [1,-18,0,19], [19,19,1,1], [-19,0,19,-2] ], //Г
//6
			[ [2,19,0,-19], [-1,1,20,20], [19,0,-19,-2], [-20,-20,-1,1] ], //Г зеркальная
//7
			[ [0,0,0,-19], [0,1,1,19], [19,0,0,0], [-19,-1,-1,0] ] //четвёрка _~_
		];

//обнуление данных о начальном положении фигур
function fig_const()
{
	for (var i=0; i < figure_constant.length; i++)
		for (var j=0; j < figure_constant[i].length; j++)
			figure[i][j] = figure_constant[i][j];
}

//создание массива данных контрольной области для проверки линий
function line_control_array()
	{
		for (var i = 0; i < colrow; i++)
		{
			lines[i]= new Array();
			for (var j = 0; j < 10; j++)
			{
				lines[i][j]= j+i*(colrow);
			}
		}
	}

///////////////////ИСПОЛНИТЕЛЬНЫЙ БЛОК///////////////////////////////
$(document).ready(function() {

	line_control_array(); //создание массива line
	$($(".dot").get(18)).html(score);//вывод очков

	$(".dot").bind({
		mouseenter: function() {colorSwitch(this, leftright)}
//		mouseleave: function() {normal(this);}
	});
	var start;
	$("#start").click(function()
		{
		auto_down(speed);
		});
	$("#pause").click(function(){ timer = false;});
	
	$("#up").click(function(){line_control()});
	// $("#left").click(function(){fig_const()});

//считывание клавиатуры
	window.addEventListener('keydown', function(e)
	{
		if (timer)
		{
			if (e.key == 'ArrowLeft') direct('left',z_object);//налево
			if (e.key == 'ArrowRight') direct('right',z_object);//направо
			if (e.key == 'ArrowUp') rotater(z_object); //кнопка поворота объекта
			if (e.key == 'ArrowDown') for(i=0;i<6;i++)direct('down',z_object); //кнопка ускорения
		}
		
	});

});
///////////////////////////////////////////////////

/////////////БЛОК АНИМИРОВАНИЯ ПЕРЕМЕЩЕНИЯ////////////////////
//функция нормализации
	function normal(obj)
	{
		$(obj).css('transitionDuration',"0s");
		$(obj).css('transform',norm);
	}
//функция смены цвета
	function colorSwitch(object, direction)
	{
		var color = ($(object).css('backgroundColor') == color_dark) ? color_light: color_dark;
		$(object).toggleClass('wall');
		colored(object,color,direction);
	}
//функция окрашивания
	function colored(object,color,direction)
	{
		$(object).css('transitionDuration', duration);
		$(object).css('backgroundColor',color).css('transform',direction);
	}

/////////////БЛОК ПОВЕДЕНИЯ ОБЪЕКТОВ////////////////////////////////

//здесь будет функция появления нового объекта
var figure_index = Math.floor((Math.random()*figure.length));
var z_object = figure[figure_index]; //для проверки подстановка фигур

function active_z()
{
figure_index = Math.floor((Math.random()*figure.length));
	for (var i=0; i < 4; i++)
		z_object[i] = figure[figure_index][i];
	//поворот изначального состояния объекта
	rotate_index = 0;//обнуление поворота
	var rand = Math.floor((Math.random()*5));
	for (var i=0; i < rand; i++) rotater(z_object);
}

///////////////--Поворот объекта--//////////////////////////
	function rotater(what_rotate)
	{
		//зацикливание индекса поворота 1-2-3-0 //и смена его значения на ++
		rotate_index = (rotate_index !== 3) ? ++rotate_index : 0;
		var turn = figure_rotater[figure_index][rotate_index];//уменьшение размера переменной

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
				colored($(".dot").get(what_rotate[i]), color_dark, leftright);
				//смена значений для поворота
				what_rotate[i] += turn[i];
			}

			for (var i=0; i < 4 ; i++)	//пересоздание объекта по новым адресатам
				colored($(".dot").get(what_rotate[i]), color_light, updown);
		}
		else {rotate_index = (rotate_index !== 0) ? --rotate_index : 3;} //если препятствие, то индекс минусуется
	}

////////////////--Перемещение объектов--///////////////////////////////
	function direct(to, what)
	{
		var n =  (to == 'down') ? colrow : //значение смещения вниз
					(to == 'left') ? -1 : 1; //либо направо/налево

		var rotate = (to == 'down') ? updown : leftright;//определение направления анимации поворота кругляшей

		//проверка на препятствия
		var min_left = 1,	min = 1,	min_bottom = 1;
		for (var i=0; i < 4; i++)
		{
		min_left = (what[i] % 20 == 0 ) ? 0 : min_left; //CТЕНА СЛЕВА
		min = ($($(".dot").get(what[i]+n)).attr("class") == 'dot wall') ? 0 : min; //твёрдый объект .wall рядом
		min_bottom = (what[i]+n > 399 ) ? 0 : min_bottom;//ПОЛ СНИЗУ
		}

		//корректировка перемещения от препятствий
		if ((min_left == 0 || min == 0) && to == 'left') ++n;
		if (min == 0 && to == 'right') --n;
		if ((min_bottom == 0 || min == 0) && to == 'down') n-=colrow;
		
		//стирание объекта
		for (var i=0; i < 4; i++)
		{
			colored($(".dot").get(what[i]), color_dark, rotate);
			normal($(".dot").get(what[i]));
		}
		//прорисовка объекта
		for (var i=0; i < 4; i++)
		{
			what[i]+=n;
			colored($(".dot").get(what[i]), color_light, rotate);
		}
		//передача управления новому объекту
		if ((min_bottom == 0 || min == 0) && to == 'down')
		{
			for (var i=0; i < 4; i++)
			$($(".dot").get(what[i])).toggleClass('wall',true);//объект превращается в wall
			line_control();//запуск считывания линий
			fig_const(); //перезаливка промежуточного массива
			active_z(); //перезапись нового объекта

		}
}

//автоматическое перемещение вниз
	function auto_down(speed,onof)
	{
		var timerId = setTimeout(function fall_down() {
		if (timer)
		{
		direct('down', z_object);
		timer = setTimeout(fall_down, speed);
		}
		}, speed);
	}


///////////-ФУНКЦИИ МАНИПУЛЯЦИИ С ЛИНИЯМИ//////////////////

//проверка на сложенную линию

function line_control()
	{
		var line_complete;
		for (var i=19; i > -1; i--)
		{
			line_complete = 0;
			for (var j=0; j < 10; j++)
			{
				line_complete = ($($(".dot").get(lines[i][j])).attr("class") == 'dot wall') ? ++line_complete : line_complete;
			}
			if (line_complete == 10)
			{	duration = '1s';
				for (var j=0; j < 10; j++) //убираем первую строку
				{
					colored($(".dot").get(lines[i][j]), color_dark, updown);//анимация сокращения строки
					$($(".dot").get(lines[i][j])).toggleClass('wall',false);//убираем значение wall
				}
				score++;//прибавляем очко
				$($(".dot").get(18)).html(score);
				//перенос всего материала вниз на одну строку

				//считываем
				var line_to_switch = new Array(),
					line_i=0;

				for (var ii=i-1; ii > -1; ii--)
					for (var j=0; j < 10; j++)
					{
						//[i]=line_i;
						line_to_switch[line_i]=$($(".dot").get(lines[ii][j])).attr("class");
						line_i++;
					}

				//зачищаем
				duration = '0s';
				var fist_line_animation=true;
				for (var ii=i-1; ii > -1; ii--)
				{
					for (var j=0; j < 10; j++)
					{
						$($(".dot").get(lines[ii][j])).toggleClass('wall',false);
						colored($(".dot").get(lines[ii][j]), color_dark, updown);//анимация сокращения строки
					}
				}

				//рисуем на row вниз
				line_i=0;
				for (var ii=i; ii > -1; ii--)
					for (var j=0; j < 10; j++)
					{
						$($(".dot").get(lines[ii][j])).attr("class", line_to_switch[line_i]);
						if (line_to_switch[line_i] == "dot wall")
							colored($(".dot").get(lines[ii][j]), color_light, updown);
						line_i++;
					}
				duration = '0.3s';
				i++;//для считывания опустившегося вниз на одну строку материала
			}
		}
	}
//	colored($(".dot").get(lines[19][i]), color_light, updown);
