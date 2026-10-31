/* =========================================================
   EXAMEN DE PYTHON BÁSICO · LECCIONES 3 Y 4
   Aquí puedes editar preguntas y la configuración.
   Tipos:
     mc    = opción múltiple (answer = texto EXACTO de la opción correcta)
     tf    = verdadero / falso (answer = "Verdadero" o "Falso")
     fill  = escribir lo que va en el espacio @@ (accept = respuestas válidas)
     order = ordenar líneas de código (rules = pares [antes, después])
   repaso: true  → marca la pregunta como repaso del examen anterior
   ========================================================= */
const CONFIG = {
  title: "Examen de Python básico",
  lessons: "Lecciones 3 y 4 · Evaluación",
  timeLimitMin: 30,        // minutos; al llegar a 0 se entrega solo
  passScore: 70,           // calificación aprobatoria (sobre 100)
  showReview: true,        // true = al final ven la revisión con explicaciones
  formName: "examen-python-l3-l4",
  // Opcional: URL de tu Google Apps Script (/exec) para enviar TAMBIÉN a tu Google Sheet.
  // Déjalo vacío ("") para usar solo Netlify Forms.
  sheetUrl: ""
};

const SECTIONS = {
  teo: { name: "Teoría", desc: "Tipos de datos, variables, conversiones y formateo de cadenas." },
  cod: { name: "Lectura de código", desc: "Lee cada programa y elige lo que aparece en pantalla al ejecutarlo." },
  pra: { name: "Práctica", desc: "Completa el código (escribe solo lo que va en el espacio amarillo) y arma la calculadora de comisiones." }
};

const QUESTIONS = [
  /* ---------------- PARTE 1 · TEORÍA ---------------- */
  { id: "T1", sec: "teo", type: "mc", topic: "Tipos de datos", codeOpts: true,
    text: "¿Cuál de estas es una <b>lista</b>?",
    options: ['["Jorge", "Maria", "Luci"]', '("Jorge", "Maria", "Luci")', '{"Jorge", "Maria", "Luci"}', '{"nombre": "Jorge"}'],
    answer: '["Jorge", "Maria", "Luci"]',
    explain: "Las listas van entre corchetes [ ]. Los paréntesis forman una tupla, las llaves solas un set y las llaves con llave: valor un diccionario." },
  { id: "T2", sec: "teo", type: "mc", topic: "Tipos de datos",
    text: "Si escribes <code>letras = {'a', 'b', 'a', 'c'}</code>, ¿qué pasa con la <code>'a'</code> repetida?",
    options: ["Python guarda solo una 'a', porque un set no repite elementos", "Marca error", "Se guardan las dos 'a'", "El set se convierte en una lista"],
    answer: "Python guarda solo una 'a', porque un set no repite elementos",
    explain: "Un set es un conjunto de elementos ÚNICOS: los repetidos se eliminan solos. Además, un set no garantiza ningún orden." },
  { id: "T3", sec: "teo", type: "mc", topic: "Tipos de datos",
    text: "¿Qué tipo de dato conviene usar para guardar un precio como <code>249.90</code>?",
    options: ["float", "int", "bool", "tuple"], answer: "float",
    explain: "Los números con decimales (precios, peso, altura, grados) son float. Los enteros (edad, ID, días) son int." },
  { id: "T4", sec: "teo", type: "mc", topic: "Variables y nombres", codeOpts: true,
    text: "¿Cuál nombre de variable cumple <b>todas</b> las reglas que vimos?",
    options: ["nombre_perro", "2do_perro", "nombre perro", "precio$"], answer: "nombre_perro",
    explain: "Minúsculas y _ en lugar de espacios. No puede empezar con número, no lleva espacios ni símbolos como $." },
  { id: "T5", sec: "teo", type: "mc", topic: "Variables y nombres",
    text: "¿Qué problema hay si escribes <code>print = \"hola\"</code>?",
    options: ["Ya no podrás usar print() en ese programa, porque reemplazaste la función", "Ninguno, es un buen nombre de variable", "Python muestra hola en pantalla", "Se desinstala Python"],
    answer: "Ya no podrás usar print() en ese programa, porque reemplazaste la función",
    explain: "Regla 6: no uses palabras reservadas o nombres de funciones como print o input. Si lo haces, la variable «tapa» la función y print() deja de funcionar." },
  { id: "T6", sec: "teo", type: "mc", topic: "Conversiones (casting)", codeOpts: true,
    text: "¿Cuál de estas es una conversión <b>explícita</b>?",
    options: ['float("12.5")', "3 + 2.5", '"3" + "2"', "print(12.5)"], answer: 'float("12.5")',
    explain: "Explícita = nosotros pedimos la conversión con código: float(), int(), str(). En 3 + 2.5 Python convierte solo (implícita)." },
  { id: "T7", sec: "teo", type: "mc", topic: "Conversiones (casting)",
    text: "¿De qué tipo es el resultado de <code>3 + 2.5</code>?",
    options: ["float (Python lo convierte automáticamente)", "int", "str", "Marca error porque son tipos distintos"],
    answer: "float (Python lo convierte automáticamente)",
    explain: "Es una conversión implícita: al sumar int + float, Python convierte el resultado a float (5.5). La hace Python, sin importar si usas PyCharm u otro editor." },
  { id: "T8", sec: "teo", type: "mc", topic: "Formateo de cadenas", codeOpts: true,
    text: "¿Cuál línea usa una <b>cadena literal</b> (f-string)?",
    options: ['print(f"Hola {nombre}")', 'print("Hola {nombre}")', 'print("Hola " + nombre)', 'print("Hola {}".format(nombre))'],
    answer: 'print(f"Hola {nombre}")',
    explain: "Las cadenas literales llevan una f antes de las comillas y las variables van dentro de { }. La última opción usa la función format." },
  { id: "T9", sec: "teo", type: "tf", topic: "Repaso (examen anterior)", repaso: true,
    text: "Si la alumna escribe <code>25</code>, <code>input()</code> lo guarda como número entero (int).",
    answer: "Falso",
    explain: "Falso. Todo lo que llega de input() es texto (str), aunque se vea como número. Por eso hay que convertirlo con int() o float()." },

  /* ---------------- PARTE 2 · LECTURA DE CÓDIGO ---------------- */
  { id: "C1", sec: "cod", type: "mc", topic: "Operaciones matemáticas", codeOpts: true,
    text: "¿Qué muestra este programa?", code: "print(7 // 2)",
    options: ["3", "3.5", "1", "7 // 2"], answer: "3",
    explain: "// es división entera: divide y quita los decimales. 7 / 2 sería 3.5." },
  { id: "C2", sec: "cod", type: "mc", topic: "Operaciones matemáticas", codeOpts: true,
    text: "¿Y este?", code: "print(7 % 2)",
    options: ["1", "3.5", "3", "0"], answer: "1",
    explain: "% (módulo) da el residuo de la división: 7 entre 2 es 3 y sobra 1." },
  { id: "C3", sec: "cod", type: "mc", topic: "Operaciones matemáticas", codeOpts: true,
    text: "¿Qué muestra este programa?", code: "print(2 ** 3)",
    options: ["8", "6", "5", "23"], answer: "8",
    explain: "** es potencia: 2 elevado a la 3 = 2 × 2 × 2 = 8." },
  { id: "C4", sec: "cod", type: "mc", topic: "Operaciones matemáticas", codeOpts: true,
    text: "¿Qué muestra este programa?", code: "print(10 - 2 * 3)",
    options: ["4", "24", "6", "-4"], answer: "4",
    explain: "Primero se multiplica y después se resta (como en matemáticas): 2 * 3 = 6, y 10 - 6 = 4." },
  { id: "C5", sec: "cod", type: "mc", topic: "Redondeo", codeOpts: true,
    text: "¿Qué muestra este programa?", code: "print(round(3.14159, 2))",
    options: ["3.14", "3.1", "3.142", "3"], answer: "3.14",
    explain: "round(número, decimales): el 2 indica que se dejan 2 decimales." },
  { id: "C6", sec: "cod", type: "mc", topic: "Conversiones (casting)", codeOpts: true,
    text: "¿Qué muestra este programa?", code: 'x = int("5") + 2\nprint(x)',
    options: ["7", "52", "5 + 2", "Error"], answer: "7",
    explain: 'int("5") convierte el texto "5" en el número 5, y 5 + 2 = 7.' },
  { id: "C7", sec: "cod", type: "mc", topic: "Formateo de cadenas", codeOpts: true,
    text: "¿Qué se ve en pantalla?",
    code: 'color = "rojo"\nmatricula = "ABC123"\nprint("Mi auto es {} y su matrícula {}".format(color, matricula))',
    options: ["Mi auto es rojo y su matrícula ABC123", "Mi auto es {} y su matrícula {}", "Mi auto es color y su matrícula matricula", "Error"],
    answer: "Mi auto es rojo y su matrícula ABC123",
    explain: "format() pone las variables en los { } en el mismo orden en que las escribes." },
  { id: "C8", sec: "cod", type: "mc", topic: "Formateo de cadenas", codeOpts: true,
    text: "Ojo con este: ¿qué se ve en pantalla?",
    code: 'color = "azul"\nprint("Mi auto es {color}")',
    options: ["Mi auto es {color}", "Mi auto es azul", "Mi auto es", "Error"], answer: "Mi auto es {color}",
    explain: 'Falta la f antes de las comillas. Sin la f, las llaves se imprimen tal cual. Correcto: print(f"Mi auto es {color}").' },
  { id: "C9", sec: "cod", type: "mc", topic: "Repaso (examen anterior)", repaso: true,
    text: "¿Qué pasa al ejecutar este código?",
    code: 'edad = 25\nprint("Tengo " + edad + " años")',
    options: ["Error: no se puede concatenar texto (str) con un número (int)", "Tengo 25 años", "Tengo25años", "Tengo edad años"],
    answer: "Error: no se puede concatenar texto (str) con un número (int)",
    explain: 'El + entre textos concatena, pero edad es int. Se arregla con str(edad) o con un f-string: f"Tengo {edad} años".' },

  /* ---------------- PARTE 3 · PRÁCTICA ---------------- */
  { id: "P1", sec: "pra", type: "fill", topic: "Conversiones (casting)",
    text: "Convierte el texto a un número <b>con decimales</b>.",
    code: 'precio = @@("249.90")', accept: ["float"],
    explain: 'float() convierte "249.90" (texto) en 249.9 (número decimal).' },
  { id: "P2", sec: "pra", type: "fill", topic: "Formateo de cadenas",
    text: "¿Qué letra falta para que se muestre el nombre en lugar de <code>{nombre}</code>?",
    code: 'nombre = "Ana"\nprint(@@"Hola {nombre}, bienvenida")', accept: ["f", "F"],
    explain: 'La f convierte el texto en una cadena literal: print(f"Hola {nombre}, bienvenida").' },
  { id: "P3", sec: "pra", type: "fill", topic: "Formateo de cadenas",
    text: "Completa con la función que coloca <code>total</code> dentro de las llaves.",
    code: 'total = 350\nprint("Total a pagar: {}".@@(total))', accept: ["format"],
    explain: 'La función format() reemplaza cada {} por la variable: "Total a pagar: {}".format(total).' },
  { id: "P4", sec: "pra", type: "fill", topic: "Redondeo",
    text: "Completa para que se muestre <code>1520.76</code>.",
    code: "comision = 1520.756\nprint(round(comision, @@))", accept: ["2"],
    explain: "El segundo parámetro de round() es la cantidad de decimales que quieres dejar: 2." },
  { id: "P5", sec: "pra", type: "order", topic: "Proyecto: calculadora de comisiones",
    text: "<b>Mini proyecto.</b> Ordena las líneas para armar la calculadora de comisiones del 13%. Usa las flechas ↑ ↓.",
    items: [
      { k: "a", code: 'nombre = input("¿Cómo te llamas? ")' },
      { k: "b", code: 'ventas = float(input("¿Cuánto vendiste este mes? "))' },
      { k: "c", code: "comision = ventas * 13 / 100" },
      { k: "d", code: "comision = round(comision, 2)" },
      { k: "e", code: 'print(f"{nombre}, tu comisión es de ${comision}")' }
    ],
    rules: [["a", "e"], ["b", "c"], ["c", "d"], ["d", "e"]],
    answerText: "1) pedir nombre  2) pedir ventas y convertir a float  3) calcular 13%  4) redondear a 2 decimales  5) imprimir",
    explain: "Primero se piden los datos, luego se calcula la comisión, se redondea y al final se imprime. No puedes usar una variable antes de crearla. (Pedir nombre y ventas puede ir en cualquier orden)." },
  { id: "P6", sec: "pra", type: "mc", topic: "Proyecto: calculadora de comisiones", codeOpts: true,
    text: "¿Qué muestra este programa?",
    code: 'nombre = "Maria"\nventas = float("15000")\ncomision = round(ventas * 13 / 100, 2)\nprint(f"{nombre} ganó ${comision} de comisión")',
    options: ["Maria ganó $1950.0 de comisión", "Maria ganó $1950 de comisión", "Maria ganó $1950.00 de comisión", "Error"],
    answer: "Maria ganó $1950.0 de comisión",
    explain: "ventas es float, así que el resultado también: 1950.0. round(…, 2) no agrega ceros extra; solo recorta decimales cuando hay más de 2." },
  { id: "P7", sec: "pra", type: "mc", topic: "Proyecto: calculadora de comisiones", repaso: true,
    text: "Este código marca error. ¿Por qué?",
    code: 'ventas = input("Ventas del mes: ")\ncomision = ventas * 13 / 100',
    options: ["input() devuelve texto: falta convertir ventas con float()", "El 13 debe ir entre comillas", "Falta usar round()", "Las variables no pueden llamarse ventas"],
    answer: "input() devuelve texto: falta convertir ventas con float()",
    explain: 'Todo lo que llega de input() es str y no se puede dividir texto entre números. Correcto: ventas = float(input("Ventas del mes: ")).' }
];

// Numeración automática (no editar)
QUESTIONS.forEach((q, i) => { q.num = i + 1; });
