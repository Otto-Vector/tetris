<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Проверка данных</title>
</head>
<body>
  <b>Прива, славdfgdfgdfgяне!</b>
  <p>-
  <?php
  $name = 'возле';
  $i = 1;
  $n = 3;
  $n_2 = &$n;
  // однострочный коммент
  /*многострочный 
  комментарий*/
  echo "$name переменной $i+$n=",$i+$n_2;
  echo "<br/>Версия PHP=".PHP_VERSION;
  echo PHP_OS;
  define("LI", 4800);
  echo "<br/>".LI;
  $n+=17;
  echo "прибавил 18 к переменной и получил:",++$n;
  $str1 = " Новая";
  $str1 .= " строка";
  echo $str1;
    ?>
  </p>
</body>
</html>