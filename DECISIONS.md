# Decisiones Técnicas

## 1. Estructura de carpetas y patrón de diseño

Elegí **Page Object Model (POM)** con separación por responsabilidad: `pages/`
(interacción con la UI), `tests/` (comportamiento esperado), `utils/` (lógica
reutilizable como el ordenamiento y el cliente HTTP), `fixtures/` (datos y
fixtures) y `config/` (única fuente de variables de entorno). El objetivo es que
un test se lea como una descripción del negocio y que un cambio de selector o de
URL impacte un solo archivo.

Consideré dos alternativas. **Screenplay** (actors/tasks/abilities): más
expresivo y escalable, pero añade una curva de aprendizaje que no se justifica
para un flujo único; encarece el onboarding del equipo. **Tests planos sin POM**:
más rápidos de escribir al inicio, pero la duplicación de selectores los vuelve
inmantenibles apenas crece la suite. POM es el punto medio que el equipo entiende
de inmediato y escala razonablemente.

## 2. Escalar a 200+ tests

1. **Estado de sesión reutilizable**: guardar el login con `storageState` una
   vez y reutilizarlo, evitando repetir el flujo de autenticación en cada test
   (ahorra minutos a escala).
2. **Sharding + paralelismo**: dividir la ejecución con `--shard` en una matriz
   de CI y agrupar por dominio funcional (checkout, cuenta, catálogo) usando
   `@tag`, para poder correr subconjuntos (smoke vs. regresión).

Complementaría con capa de servicios/API para precondiciones (crear datos vía
API en lugar de UI) y una convención estricta de nombres/tags para filtrar.

## 3. Test data con múltiples roles (admin, cliente, operador)

Modelaría los usuarios como datos, no como código: un catálogo de roles
(`fixtures/roles`) donde cada rol resuelve sus credenciales desde variables de
entorno/Secrets (nunca hardcodeadas). Expondría una **fixture parametrizada por
rol** que provee una sesión ya autenticada (`storageState` por rol), de modo que
el test declare "como admin…" y reciba el contexto correcto. Para datos
transaccionales, usaría factories/builders que generen datos frescos por test y
limpien al final, garantizando aislamiento y evitando dependencias entre pruebas.

## 4. Pipeline por debajo de 3 minutos

- **Cachear** `~/.npm` y los navegadores de Playwright para eliminar
  reinstalaciones en cada corrida.
- **Paralelizar con `--shard`** en varios runners y luego `merge-reports` para
  un reporte HTML único.
- **Instalar solo el navegador necesario** (`playwright install chromium`) en vez
  de todos, y correr la suite de integración (sin browser) como job separado y
  veloz que da feedback temprano.
- Priorizar un **job de smoke** con los tests críticos marcados por tag para el
  feedback inicial, dejando la regresión completa en paralelo.

**Trade-off:** el sharding reduce el tiempo de reloj pero consume más minutos de
runner y añade complejidad (merge de reportes); se justifica cuando el tiempo de
feedback es crítico para el equipo.
