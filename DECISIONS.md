# Decisiones Técnicas

## 1. ¿Por qué elegí la estructura de carpetas y el patrón de diseño que usé?

Elegí trabajar con **Page Object Model (POM)** porque era uno de los requisitos del reto y porque es un patrón con el que ya he trabajado en proyectos de automatización.

La idea fue mantener una estructura simple donde cada carpeta tenga una responsabilidad clara: los **Page Objects** contienen las interacciones con la aplicación, los **tests** describen los escenarios, las **fixtures** preparan el contexto necesario y la configuración queda centralizada. Esto hace que el proyecto sea más fácil de leer y, sobre todo, de mantener.

Como alternativa pude haber implementado toda la lógica directamente en los tests. Para un proyecto pequeño funciona, pero cuando empiezan a crecer los escenarios se termina duplicando código y cualquier cambio en la interfaz obliga a modificar varios archivos. La única desventaja de POM es que requiere crear más clases al inicio, pero considero que ese esfuerzo se compensa cuando el proyecto empieza a crecer.

## 2. ¿Qué agregaría o cambiaría si la suite creciera a más de 200 pruebas?

Lo primero sería dividir la ejecución utilizando el paralelismo de Playwright para aprovechar mejor los runners del pipeline. También organizaría los escenarios con etiquetas como **smoke**, **regression** o **critical**, de forma que cada pipeline ejecute únicamente las pruebas que realmente necesita.

Además, intentaría preparar las precondiciones por API cuando sea posible, en lugar de hacerlo desde la interfaz. Esto reduce el tiempo de ejecución y hace que las pruebas sean más estables. El reto está en mantener una buena organización de la suite para que esa estrategia siga siendo fácil de administrar.

## 3. ¿Cómo manejaría los datos de prueba si existieran varios roles (admin, cliente y operador)?

Evitaría dejar usuarios o contraseñas dentro del código. Las credenciales las manejaría mediante variables de entorno.

Además, crearía una **fixture** que reciba el rol con el que necesita trabajar el escenario y entregue una sesión autenticada utilizando **storageState**. Así cada prueba solo indica el tipo de usuario que requiere y no tiene que repetir el proceso de login. Si los datos cambian durante la ejecución, generaría información nueva para evitar dependencias entre pruebas.

## 4. ¿Qué haría diferente en el pipeline si el tiempo total de ejecución debiera mantenerse por debajo de 3 minutos?

Primero, reutilizaría la caché de dependencias y de los navegadores para no instalarlos en cada ejecución. Después distribuiría los tests en paralelo entre varios runners para aprovechar mejor la infraestructura. Finalmente, separaría las pruebas rápidas de las más pesadas, ejecutando primero un conjunto pequeño de pruebas críticas (**smoke**) para obtener una validación temprana.

La desventaja es que el pipeline se vuelve un poco más complejo y puede requerir más recursos de infraestructura, pero en proyectos grandes normalmente vale la pena porque el equipo recibe retroalimentación mucho más rápido.

