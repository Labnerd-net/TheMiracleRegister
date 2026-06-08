import "dotenv/config";
import { createDb } from "./index";
import * as schema from "./schema";

const db = createDb(process.env.DATABASE_URL!);

const LOREM_BIO =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

const LOREM_SYNOPSIS =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet consectetur adipisci velit.";

const CARLO_ACUTIS_BIO_NOTE =
  "Note: Carlo's body was exhumed in 2007 and found to have undergone normal decay (not incorrupt). His remains are displayed in a glass tomb at the Sanctuary of Santa Maria Maggiore in Assisi, covered with a wax layer molded to resemble his living appearance — a common Italian tradition also used for St. John XXIII. The Church has NOT declared his body incorrupt. He wears a tracksuit and sneakers. Popular online claims of incorruptibility are inaccurate.";

async function seed() {
  console.log("Clearing existing data...");
  await db.delete(schema.miracleSources);
  await db.delete(schema.saintLocations);
  await db.delete(schema.saintSources);
  await db.delete(schema.saintRelations);
  await db.delete(schema.miracleSaints);
  await db.delete(schema.miracles);
  await db.delete(schema.saints);

  console.log("Seeding saints...");

  const insertedSaints = await db
    .insert(schema.saints)
    .values([
      {
        slug: "john-paul-ii",
        published: true,
        name: "Pope John Paul II",
        saint_name: "Saint John Paul II",
        birth_name: "Karol Jozef Wojtyla",
        birth_date: "1920-05-18",
        death_date: "2005-04-02",
        feast_day: "October 22",
        nationality: "Polish",
        beatification_date: "2011-05-01",
        beatified_by: "Pope Benedict XVI",
        canonization_date: "2014-04-27",
        canonized_by: "Pope Francis",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["World Youth Day", "families", "young Catholics"],
        themes: ["perseverance", "missionaries", "eucharistic", "marian", "conversion"],
        biography_short: `Karol Józef Wojtyła was born on May 18, 1920, in Wadowice, Poland, the youngest of three children of a devout Catholic family. His early life was shaped by loss — his mother died when he was eight, his older brother when he was twelve, and his father when he was twenty. By then, he was alone.

He studied Polish literature at the Jagiellonian University in Kraków until the Nazi occupation of Poland forced the university underground. During the war years he worked in a quarry and chemical factory while secretly studying for the priesthood. He was ordained on November 1, 1946.

His rise through the Church was rapid. He was appointed bishop in 1958, Archbishop of Kraków in 1964, and elevated to cardinal in 1967. On October 16, 1978, he was elected Pope — the first non-Italian pontiff in 455 years and the first Polish pope in history. He took the name John Paul II.

His 26-year pontificate was one of the most consequential in modern history. He traveled to 129 countries — more than any pope before him — and drew millions to World Youth Days he personally founded. His moral and political witness was widely credited as a decisive factor in the peaceful collapse of communism in Eastern Europe. He was shot and nearly killed in St. Peter's Square on May 13, 1981; he later visited his would-be assassin in prison and publicly forgave him.

He died on April 2, 2005, to an outpouring of grief that drew an estimated four million people to Rome. He was beatified by Pope Benedict XVI on May 1, 2011, and canonized by Pope Francis on April 27, 2014, alongside Pope John XXIII.`,
        gender: "male",
        lay_person: false,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/3/34/JPII_29_09_2004_2.JPG",
        wikipedia_url: "https://en.wikipedia.org/wiki/Pope_John_Paul_II",
      },
      {
        slug: "mother-teresa",
        published: true,
        name: "Mother Teresa",
        saint_name: "Saint Teresa of Calcutta",
        birth_name: "Anjeze Gonxhe Bojaxhiu",
        birth_date: "1910-08-26",
        death_date: "1997-09-05",
        feast_day: "September 5",
        religious_order: "Missionaries of Charity",
        nationality: "Albanian / Indian",
        beatification_date: "2003-10-19",
        beatified_by: "Pope John Paul II",
        canonization_date: "2016-09-04",
        canonized_by: "Pope Francis",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["World Youth Day", "Missionaries of Charity"],
        themes: ["conversion", "missionaries", "hope", "perseverance", "eucharistic"],
        biography_short: `Anjezë Gonxhe Bojaxhiu was born on August 26, 1910, in Skopje, in what is now North Macedonia, to an Albanian Catholic family. Her father died when she was eight. She grew up devout and drawn to missionary work, and at eighteen left home to join the Sisters of Loreto in Ireland — a departure she later described as a final farewell, knowing she would not return. She never did.

She took her final vows in 1937 and spent the next decade teaching at St. Mary's High School in Kolkata. Then, on September 10, 1946, while traveling by train to a spiritual retreat, she received what she called a "call within a call" — a directive she understood as Christ asking her to leave the convent and serve the poorest of the poor in the slums of the city. It took two years to receive permission. She left with five rupees and no plan.

She founded the Missionaries of Charity in 1950. The order began with thirteen members in Kolkata; by the time of her death it operated in approximately 123 countries, running hospices, orphanages, and homes for the destitute and dying. She received the Nobel Peace Prize in 1979, donating the prize money to the poor.

After her death, letters she had written to her spiritual directors over decades were published, revealing a prolonged interior darkness — a sense of God's absence that had endured for most of her public ministry. The letters were striking for what they showed: a woman who served with apparent joy while privately experiencing desolation, and who chose to continue regardless.

She died on September 5, 1997. She was beatified by Pope John Paul II on October 19, 2003, and canonized by Pope Francis on September 4, 2016, as Saint Teresa of Calcutta.`,
        gender: "female",
        lay_person: false,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/8/8e/MotherTeresa_090.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Mother_Teresa",
      },
      {
        slug: "padre-pio",
        name: "Padre Pio",
        saint_name: "Saint Pio of Pietrelcina",
        birth_name: "Francesco Forgione",
        birth_date: "1887-05-25",
        death_date: "1968-09-23",
        feast_day: "September 23",
        religious_order: "Capuchin Franciscan",
        nationality: "Italian",
        beatification_date: "1999-05-02",
        beatified_by: "Pope John Paul II",
        canonization_date: "2002-06-16",
        canonized_by: "Pope John Paul II",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["stress relief", "civil defense volunteers", "adolescents"],
        themes: ["eucharistic", "marian", "spiritual-direction", "conversion", "perseverance"],
        biography_short: `Francesco Forgione was born on May 25, 1887, in Pietrelcina, a small hill town in the Campania region of southern Italy. He was the fourth of eight children in a devout peasant family; his father emigrated to America twice to earn money for the boy's education in a religious vocation. From childhood Francesco experienced visions and apparitions he believed were supernatural, and he entered the Capuchin Franciscan novitiate in 1903 at the age of fifteen. He took the name Pio. He was ordained a priest on August 10, 1910.

His early years in religious life were marked by chronic ill health — fevers, respiratory problems, and other ailments that repeatedly forced him to return home from his friary. In 1916 he was assigned permanently to the friary of Our Lady of Grace at San Giovanni Rotondo in Apulia, where he would remain for the rest of his life.

On September 20, 1918, while making his thanksgiving after Mass, he received the visible stigmata — the five wounds corresponding to the Passion of Christ — on his hands, feet, and side. The wounds remained open and bleeding for fifty years, until his death, and were examined by numerous physicians, Vatican investigators, and Church authorities over that period. He was the first Catholic priest known to bear the stigmata.

He became one of the most sought-after confessors of the twentieth century, hearing confessions for up to sixteen hours a day. Thousands came to San Giovanni Rotondo to seek his counsel, and reports of healings, prophecies, bilocation, and reading of souls accumulated throughout his decades of ministry. In 1956 he founded Casa Sollievo della Sofferenza — the House for the Relief of Suffering — a hospital adjacent to the friary that grew into one of the largest medical centers in southern Italy.

He died on September 23, 1968, having celebrated his fiftieth anniversary of the stigmata just three days earlier. The wounds on his hands had closed completely at the time of death, leaving no scars. He was beatified by Pope John Paul II on May 2, 1999, and canonized on June 16, 2002.`,
        gender: "male",
        lay_person: false,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Padre_Pio_portraitFXD.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Padre_Pio",
        published: true,
      },
      {
        slug: "faustina-kowalska",
        name: "Faustina Kowalska",
        saint_name: "Saint Maria Faustina Kowalska",
        birth_name: "Helena Kowalska",
        birth_date: "1905-08-25",
        death_date: "1938-10-05",
        feast_day: "October 5",
        religious_order: "Congregation of the Sisters of Our Lady of Mercy",
        nationality: "Polish",
        beatification_date: "1993-04-18",
        beatified_by: "Pope John Paul II",
        canonization_date: "2000-04-30",
        canonized_by: "Pope John Paul II",
        canonization_type: "virgin",
        canonization_stage: "saint",
        patronage: ["Divine Mercy devotion", "sinners", "World Youth Day"],
        themes: ["conversion", "marian", "perseverance", "hope", "eucharistic"],
        biography_short: LOREM_BIO,
        gender: "female",
        lay_person: false,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/0/0c/Saint_Faustyna_Kowalska_portrait_%281931%29.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Faustina_Kowalska",
      },
      {
        slug: "gianna-beretta-molla",
        name: "Gianna Beretta Molla",
        saint_name: "Saint Gianna Beretta Molla",
        birth_name: "Gianna Beretta Molla",
        birth_date: "1922-10-04",
        death_date: "1962-04-28",
        feast_day: "April 28",
        nationality: "Italian",
        beatification_date: "1994-04-24",
        beatified_by: "Pope John Paul II",
        canonization_date: "2004-05-16",
        canonized_by: "Pope John Paul II",
        canonization_type: "married_couple",
        canonization_stage: "saint",
        patronage: ["mothers", "families", "physicians", "unborn children"],
        themes: ["saints-of-everyday-life", "perseverance", "marian", "hope", "eucharistic"],
        biography_short: LOREM_BIO,
        gender: "female",
        lay_person: true,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/8/87/GiannaBerettaMolla.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Gianna_Beretta_Molla",
      },
      {
        slug: "kateri-tekakwitha",
        name: "Kateri Tekakwitha",
        saint_name: "Saint Kateri Tekakwitha",
        birth_name: "Kateri Tekakwitha",
        birth_date: "1656-01-01",
        death_date: "1680-04-17",
        feast_day: "July 14",
        nationality: "Mohawk / Native American",
        beatification_date: "1980-06-22",
        beatified_by: "Pope John Paul II",
        canonization_date: "2012-10-21",
        canonized_by: "Pope Benedict XVI",
        canonization_type: "virgin",
        canonization_stage: "saint",
        patronage: ["Native Americans", "ecology", "environmentalists", "exiles"],
        themes: ["conversion", "marian", "missionaries", "perseverance", "hope"],
        biography_short: LOREM_BIO,
        gender: "female",
        lay_person: true,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/1/14/Kateri_Tekakwitha_1690.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Kateri_Tekakwitha",
      },
      {
        slug: "andre-bessette",
        published: true,
        name: "Brother Andre",
        saint_name: "Saint Andre of Montreal",
        birth_name: "Andre Bessette",
        birth_date: "1845-08-09",
        death_date: "1937-01-06",
        feast_day: "January 6",
        religious_order: "Congregation of Holy Cross",
        nationality: "Canadian",
        beatification_date: "1982-05-23",
        beatified_by: "Pope John Paul II",
        canonization_date: "2010-10-17",
        canonized_by: "Pope Benedict XVI",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["The sick", "family caregivers"],
        themes: ["spiritual-direction", "eucharistic", "marian", "perseverance", "saints-of-everyday-life"],
        biography_short: `André Bessette was born on August 9, 1845, in Mont-Saint-Grégoire, Quebec, into a large French-Canadian family. Orphaned young — his father died when he was a child, his mother not long after — he was raised by relatives and spent his adolescence working as a farmhand, cobbler, tinsmith, and laborer across Quebec and New England. His health was always precarious: he was small, thin, and prone to illness throughout his life.

In 1870, at twenty-five, he applied to enter the Congregation of Holy Cross as a lay brother. He was nearly turned away — his health was poor, he had almost no formal education, and the congregation doubted he could endure religious life. The Bishop of Montreal interceded on his behalf, and he was admitted. He became known as Brother André.

For forty years he served as porter — doorkeeper — at the Collège Notre-Dame in Côte-des-Neiges, Montreal. It was among the humblest positions in the community. Visitors who came to the door with ailments found him willing to sit with them, pray with them, and rub them with oil — directing all petitions not to himself but to Saint Joseph. Reports of healings circulated. More visitors came.

In 1904 he obtained permission to build a small wooden chapel to Saint Joseph on the slope of Mount Royal, across from the college. Pilgrims arrived from across Canada. The chapel grew into a shrine, and the shrine grew into the Basilica of Saint Joseph's Oratory of Mount Royal — today one of the largest churches in North America, drawing millions of visitors each year. The walls of the original chapel were lined with crutches and canes, left behind by those who said they had been healed.

He became known as the Miracle Man of Montreal. He deflected the attention consistently. "I do not cure," he said. "Saint Joseph cures."

He died on January 6, 1937, at the age of ninety-one — the feast day that now bears his name. He was beatified by Pope John Paul II on May 23, 1982, and canonized by Pope Benedict XVI on October 17, 2010.`,
        gender: "male",
        lay_person: false,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Fr%C3%A8re_Andr%C3%A9_1920.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Andre_Bessette",
      },
      {
        slug: "maximilian-kolbe",
        name: "Maximilian Kolbe",
        saint_name: "Saint Maximilian Kolbe",
        birth_name: "Rajmund Kolbe",
        birth_date: "1894-01-08",
        death_date: "1941-08-14",
        feast_day: "August 14",
        religious_order: "Conventual Franciscan",
        nationality: "Polish",
        beatification_date: "1971-10-17",
        beatified_by: "Pope Paul VI",
        canonization_date: "1982-10-10",
        canonized_by: "Pope John Paul II",
        canonization_type: "martyr",
        canonization_stage: "saint",
        patronage: ["addicts", "journalists", "prisoners", "families", "pro-life movement"],
        themes: ["martyrs", "marian", "perseverance", "conversion", "missionaries"],
        biography_short: `Rajmund Kolbe was born on January 8, 1894, in Zdunska Wola, in Russian-occupied Poland. His parents were devout Franciscan tertiaries; two of their sons entered religious life. Rajmund joined the Conventual Franciscan novitiate in 1907 and took the name Maximilian. He made his final profession in 1910 and was sent to Rome for studies, earning doctorates in philosophy and theology at the Gregorian and Seraphic universities.

In Rome in October 1917, he founded the Militia Immaculatae — the Knights of the Immaculate — a Marian apostolate aimed at the conversion of sinners and enemies of the Church. It grew into a worldwide movement. He was ordained a priest on April 28, 1918, returned to Poland, and in 1927 founded Niepokalanów — City of the Immaculate — a Franciscan friary near Warsaw that became one of the largest in the world, housing more than 700 brothers and operating a publishing house, radio station, and press that reached hundreds of thousands of readers.

In 1930 he traveled to Japan and founded a monastery near Nagasaki — positioned on the side of a mountain that would shelter it from the atomic bomb fifteen years later. He returned to Poland in 1936 to lead Niepokalanów. When Germany invaded in September 1939, Kolbe and his brothers sheltered thousands of Polish refugees, including Jews. He was arrested by the Gestapo on February 17, 1941, and transferred to Auschwitz on May 28 as prisoner 16670.

In late July 1941, a prisoner escaped and Nazi camp policy required ten men from the same barracks to be starved to death in reprisal. When one of the selected men — Franciszek Gajowniczek, a married father — cried out for his family, Kolbe stepped forward and asked to take his place. The camp commander permitted it. Kolbe and the nine others were locked in an underground bunker without food or water. He led them in prayer and hymns. After two weeks, four men remained alive. On August 14, 1941 — the eve of the Assumption — an SS guard administered lethal phenol injections to those still living, Kolbe among them.

He was beatified by Pope Paul VI on October 17, 1971. At his canonization on October 10, 1982, Pope John Paul II declared Kolbe a martyr of charity, the first person so designated in the modern canonization process. Franciszek Gajowniczek, the man whose place Kolbe had taken, was present at the ceremony.`,
        gender: "male",
        lay_person: false,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Fr.Maximilian_Kolbe_1939.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Maximilian_Kolbe",
        published: true,
      },
      {
        slug: "louis-martin",
        name: "Louis Martin",
        saint_name: "Saint Louis Martin",
        birth_name: "Louis Martin",
        birth_date: "1823-08-22",
        death_date: "1894-07-29",
        feast_day: "July 12",
        nationality: "French",
        beatification_date: "2008-10-19",
        beatified_by: "Pope Benedict XVI",
        canonization_date: "2015-10-18",
        canonized_by: "Pope Francis",
        canonization_type: "married_couple",
        canonization_stage: "saint",
        patronage: ["married couples", "families", "parents", "Catholic families"],
        themes: ["saints-of-everyday-life", "conversion", "perseverance", "hope", "marian"],
        biography_short: `Louis Joseph Aloys Stanislaus Martin was born on August 22, 1823, in Bordeaux, France, the son of a soldier in the post-Napoleonic army. His childhood was spent moving between garrison towns before the family settled in Alençon.

As a young man, Louis sought a life of religious consecration. He applied to enter the monastery of the Canons Regular of the Great Saint Bernard in Switzerland but was refused — he had not learned Latin, a requirement for admission. He returned to France, took up watchmaking, and opened his own shop in Alençon. He was a devoted Catholic: a member of the Third Order of Saint Francis, a regular at daily Mass, a man who spent hours before the Blessed Sacrament. He loved fishing and long pilgrimage walks.

He met Azélie-Marie Guérin on the Pont Saint-Léonard bridge in Alençon. They married on July 13, 1858, at the Basilica of Notre-Dame. Together they had nine children; four died young, including three sons in infancy and a daughter, Marie Hélène, at age five. The five daughters who survived all entered religious life — among them Marie-Françoise-Thérèse, who became Saint Thérèse of Lisieux.

When Zélie died of breast cancer in 1877, Louis sold his business and moved the family to Lisieux in 1882 to be closer to his daughters' religious communities. In his later years he suffered a series of strokes and mental deterioration. From 1889 to 1892 he was cared for at the Bon Sauveur psychiatric institution in Caen — a suffering his daughter Thérèse described as his most painful trial, and one she offered for her own vocation.

He died on July 29, 1894, in Lisieux. He was beatified with Zélie by Pope Benedict XVI on October 19, 2008, and canonized by Pope Francis on October 18, 2015 — the first married couple in the history of the Church to be canonized together.`,
        gender: "male",
        lay_person: true,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/3/38/Louis_Martin_1.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Louis_Martin_and_Marie-Az%C3%A9lie_Gu%C3%A9rin",
        published: true,
      },
      {
        slug: "zelie-martin",
        name: "Zélie Martin",
        saint_name: "Saint Zélie Martin",
        birth_name: "Zelie Guerin Martin",
        birth_date: "1831-12-23",
        death_date: "1877-08-28",
        feast_day: "July 12",
        nationality: "French",
        beatification_date: "2008-10-19",
        beatified_by: "Pope Benedict XVI",
        canonization_date: "2015-10-18",
        canonized_by: "Pope Francis",
        canonization_type: "married_couple",
        canonization_stage: "saint",
        patronage: ["married couples", "families", "parents", "Catholic families"],
        themes: ["saints-of-everyday-life", "conversion", "perseverance", "hope", "marian"],
        biography_short: `Azélie-Marie Guérin was born on December 23, 1831, in Gandelain, a small village near Alençon in Normandy, France. She was baptized on Christmas Eve. Her father was a gendarme; her childhood was marked by strictness and austerity, an atmosphere she later described as joyless. She grew up with a deep faith that she found not through her home but in spite of it.

As a young woman she applied to join the Daughters of Charity in Alençon, hoping for religious life. She was refused — her health, particularly her respiratory condition, was considered insufficient. She accepted the refusal as a sign and turned instead to lacemaking. She taught herself the extraordinarily painstaking technique of Alençon point lace — considered among the most difficult needlework in Europe — and built it into a successful commercial enterprise. She managed orders, correspondence, and a network of home workers while maintaining her own output. She was an astute businesswoman.

She met Louis Martin on the Pont Saint-Léonard bridge in Alençon. They married on July 13, 1858, at the Basilica of Notre-Dame. Both had attempted religious life and been refused; both brought to their marriage an interior life that shaped their household. They had nine children together. Four died young — three sons in infancy and their daughter Marie Hélène at age five. The five daughters who survived all entered religious life. The youngest, Marie-Françoise-Thérèse, became Saint Thérèse of Lisieux.

Zélie managed her lacemaking business until ill health forced her to stop. She was diagnosed with breast cancer and endured its progression for years while continuing to raise her children and correspond with family in hundreds of letters — a rare intimate record of a 19th-century Catholic family. She died on August 28, 1877, in Alençon, at the age of forty-five. Thérèse was four years old.

She was beatified with Louis by Pope Benedict XVI on October 19, 2008, and canonized by Pope Francis on October 18, 2015.`,
        gender: "female",
        lay_person: true,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Z%C3%A9lie_Martin_1.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Louis_Martin_and_Marie-Az%C3%A9lie_Gu%C3%A9rin",
        published: true,
      },
      {
        slug: "carlo-acutis",
        name: "Carlo Acutis",
        saint_name: "Saint Carlo Acutis",
        birth_name: "Carlo Acutis",
        birth_date: "1991-05-03",
        death_date: "2006-10-12",
        feast_day: "October 12",
        nationality: "Italian",
        beatification_date: "2020-10-10",
        beatified_by: "Cardinal Agostino Vallini (Assisi)",
        canonization_date: "2025-09-07",
        canonized_by: "Pope Leo XIV",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["computer programmers", "internet users", "youth", "Eucharistic devotion"],
        themes: ["technology", "eucharistic", "conversion", "perseverance", "hope"],
        biography_short: `${LOREM_BIO}\n\n${CARLO_ACUTIS_BIO_NOTE}`,
        gender: "male",
        lay_person: true,
        wikipedia_url: "https://en.wikipedia.org/wiki/Carlo_Acutis",
      },
      {
        slug: "juan-diego",
        name: "Juan Diego",
        saint_name: "Saint Juan Diego",
        birth_name: "Juan Diego Cuauhtlatoatzin",
        birth_date: "1474-01-01",
        death_date: "1548-01-01",
        feast_day: "December 9",
        nationality: "Aztec / Indigenous Mexican",
        beatification_date: "1990-05-06",
        beatified_by: "Pope John Paul II (equipollent)",
        canonization_date: "2002-07-31",
        canonized_by: "Pope John Paul II",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["indigenous peoples of the Americas"],
        themes: ["conversion", "marian", "perseverance", "hope", "saints-of-everyday-life"],
        biography_short: LOREM_BIO,
        gender: "male",
        lay_person: true,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Juan-Diego.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Juan_Diego",
      },
    ])
    .returning({ id: schema.saints.id, slug: schema.saints.slug });

  console.log(`Inserted ${insertedSaints.length} saints.`);

  const saintId = (slug: string) => {
    const s = insertedSaints.find((r) => r.slug === slug);
    if (!s) throw new Error(`Saint not found: ${slug}`);
    return s.id;
  };

  console.log("Seeding saint relations...");

  await db.insert(schema.saintRelations).values([
    {
      saint_id: saintId("louis-martin"),
      related_saint_id: saintId("zelie-martin"),
      relation_type: "canonized_together",
    },
    {
      saint_id: saintId("zelie-martin"),
      related_saint_id: saintId("louis-martin"),
      relation_type: "canonized_together",
    },
  ]);

  console.log("Seeding miracles...");

  const insertedMiracles = await db
    .insert(schema.miracles)
    .values([
      // ── John Paul II ──────────────────────────────────────────────────────────
      {
        slug: "healing-of-sr-marie-simon-pierre",
        published: true,
        title: "Healing of Sr. Marie Simon-Pierre",
        miracle_category: "intercessory",
        type: "healing",
        topics: [],
        date_of_event: "2005-06-02",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Aix-en-Provence",
        location_lat: "43.5298424",
        location_lng: "5.4474738",
        country: "France",
        recipient_name: "Sr. Marie Simon-Pierre",
        recipient_gender: "female",
        recipient_country: "France",
        recipient_privacy: "public",
        recipient_age_at_event: 44,
        recipient_age_approximate: true,
        medical_diagnosis: "Parkinson's disease (diagnosed 2001)",
        cure_details:
          "Severe Parkinson's — could not write or drive. On the night of June 2, she felt compelled to write JPII's name and found her hand steady. Complete recovery.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "2009-01-01",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_decree_date: "2011-01-14",
        vatican_medical_board_verdict: "Declared medically inexplicable; miracle decree promulgated January 14, 2011",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Sister Marie Simon-Pierre Normand was a French nun with the Congregation of the Little Sisters of Catholic Motherhood. In 2001, at the age of thirty-nine, she was diagnosed with Parkinson's disease — the same illness that had visibly consumed Pope John Paul II in his final years.

By 2005 her condition had deteriorated significantly. The tremors in her left hand had spread. She could no longer drive, could barely write, and struggled to perform the basic duties of her work. Her superior described her handwriting as nearly illegible. Other sisters in her congregation were praying for John Paul II's intercession on her behalf, though Marie Simon-Pierre initially resisted — she felt the connection between her illness and his was too close, almost presumptuous.

John Paul II died on April 2, 2005. Two months later, on the evening of June 2, her superior asked her again to write John Paul II's name as a prayer — a simple act of petition. She complied reluctantly. Her hand was steady. The tremor was gone.

She slept that night and woke the following morning with no symptoms. She was examined by her doctors, who found no clinical trace of the disease. The neurological deterioration that had been progressing for four years had stopped and reversed. She returned to full nursing duties within weeks.

The case was submitted to the Vatican's Consulta Medica, the independent panel of physicians that evaluates miracle claims for the Holy See. After exhaustive review, the board declared in 2009 that her healing was medically inexplicable — spontaneous, complete, and lasting, with no scientific explanation consistent with the natural course of Parkinson's disease. Pope Benedict XVI recognized the miracle, and Sr. Marie Simon-Pierre's healing became the basis for John Paul II's beatification on May 1, 2011.

She has spoken publicly about the experience many times since, including at the beatification ceremony itself. She has described the moment not as dramatic or overwhelming, but quiet — a stillness where there had been trembling.`,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-floribeth-mora-diaz",
        published: true,
        title: "Healing of Floribeth Mora Diaz",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["mothers"],
        date_of_event: "2011-05-01",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Costa Rica (home)",
        location_lat: "9.9327707",
        location_lng: "-84.0796144",
        country: "Costa Rica",
        recipient_name: "Floribeth Mora Diaz",
        recipient_gender: "female",
        recipient_country: "Costa Rica",
        recipient_privacy: "public",
        medical_diagnosis: "Severe brain aneurysm (diagnosed April 2011, terminal, sent home to die)",
        cure_details:
          "While watching JPII's beatification on TV, she heard his voice say \"Don't be afraid. I am with you.\" She felt immediate improvement.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "2013-01-01",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable in 2013",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: `Floribeth Mora Díaz was a Costa Rican woman and mother of four. In April 2011, at the age of forty-nine, she was diagnosed with a cerebral aneurysm — an abnormal bulge in an artery wall in the brain. Her doctors at the Hospital de la Mujer in San José delivered a stark assessment: the aneurysm was inoperable, treatment was not feasible, and she had approximately one month to live. She was sent home.

On May 1, 2011, she lay in bed watching the televised broadcast of John Paul II's beatification ceremony in Rome. She had a magazine beside her — a special edition featuring John Paul II's image on the cover. Her family had been praying for his intercession, though she had little hope left. At the moment when Pope Benedict XVI proclaimed the beatification, she heard a voice. She later described it as clear and calm: "Get up. Don't be afraid. I am with you."

She rose from bed. The debilitating headaches that had accompanied her condition were gone. She felt, by her own account, completely well. Her family, expecting her death within weeks, found her standing.

Her subsequent medical examinations showed no trace of the aneurysm. The imaging that had documented the lesion showed nothing. Her neurologists, who had given her weeks to live, could not explain the resolution of a condition that does not resolve on its own.

The case was referred to the Vatican's Consulta Medica, which reviewed the full medical record and concluded in 2013 that the healing was instantaneous, complete, and beyond medical explanation. Pope Francis recognized the miracle, and Floribeth Mora Díaz was present at St. Peter's Square on April 27, 2014, when John Paul II was canonized — the miracle that made his canonization possible having happened to her.

She has since traveled internationally to speak about her experience and has met multiple times with Pope Francis.`,
        has_primary_sources: true,
      },

      // ── Mother Teresa ─────────────────────────────────────────────────────────
      {
        slug: "healing-of-monica-besra",
        published: true,
        title: "Healing of Monica Besra",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["mothers", "financial-hardship"],
        date_of_event: "1998-09-05",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Nadia district, West Bengal",
        location_lat: "23.4847374",
        location_lng: "88.5567067",
        country: "India",
        region: "West Bengal",
        recipient_name: "Monica Besra",
        recipient_gender: "female",
        recipient_country: "India",
        recipient_privacy: "public",
        medical_diagnosis: "Large abdominal tumor with concurrent abdominal tuberculosis (treated since 1997)",
        cure_details:
          "After applying a medallion of Mother Teresa and praying, she felt intense warmth and the tumor disappeared.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "2002-01-01",
        intercessory_medium: "medallion",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable in 2002",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Monica Besra was a tribal woman from the Nadia district of West Bengal, India. In 1998 she was suffering from a large abdominal tumor — described in medical records as a benign ovarian or abdominal mass — as well as tuberculosis and meningitis. She had been receiving treatment at a clinic run by the Missionaries of Charity, but her condition had not improved. By the first anniversary of Mother Teresa's death, she was severely ill.

On the night of September 5, 1998 — the exact anniversary of Mother Teresa's death — sisters at the mission placed a medallion that had been touched to Mother Teresa's body against Monica Besra's abdomen and prayed. Monica Besra later described feeling an intense light and warmth emanating from the medallion. By morning, the tumor was gone.

Her physicians, who had documented the mass, examined her and found no trace of it. The sudden and complete disappearance of the tumor had no medical explanation consistent with its prior diagnosis or the absence of any intervening treatment.

The case was investigated by the Vatican's Consulta Medica, which concluded in 2002 that the healing was medically inexplicable. Pope John Paul II recognized the miracle, and it served as the basis for Mother Teresa's beatification on October 19, 2003.

The case attracted significant public controversy, particularly from Monica Besra's husband and some of her treating physicians, who attributed her recovery to conventional medical treatment. The Vatican's position, following its standard process of independent medical review, was that the available evidence did not support that conclusion.

Monica Besra has consistently maintained that she was healed through Mother Teresa's intercession. She was present at the beatification ceremony in Rome.`,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-marcilio-haddad-andrino",
        published: true,
        title: "Healing of Marcilio Haddad Andrino",
        miracle_category: "intercessory",
        type: "healing",
        topics: [],
        date_of_event: "2008-12-09",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Santos",
        location_lat: "-23.9609448",
        location_lng: "-46.3166316",
        country: "Brazil",
        region: "Sao Paulo",
        recipient_name: "Marcilio Haddad Andrino",
        recipient_gender: "male",
        recipient_country: "Brazil",
        recipient_privacy: "public",
        medical_diagnosis: "Multiple brain abscesses / viral meningoencephalitis with hydrocephalus",
        cure_details:
          "In a coma, on life support, family told to prepare for his death. His wife prayed with a relic. Doctors found him conscious the next morning with all symptoms gone.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "2015-01-01",
        intercessory_medium: "relic",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable in 2015",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: `Marcilio Haddad Andrino was a Brazilian man from Santos, in the state of São Paulo. In December 2008 he was admitted to hospital in a critical condition. He had developed multiple brain abscesses and viral meningoencephalitis — a severe infection of the brain and its surrounding membranes — complicated by hydrocephalus, an abnormal accumulation of fluid in the brain. He was placed on life support, slipped into a coma, and his physicians told his family to prepare for his death.

His wife, Fernanda, did not accept that prognosis. She obtained a relic of Mother Teresa and, on the night of December 9, 2008, gathered with family members to pray beside his bed, placing the relic against him and asking for Mother Teresa's intercession.

The following morning, December 10, Marcilio regained consciousness. His doctors, who had considered his death imminent, found him alert and responsive. Over the days that followed his condition improved rapidly and without medical explanation. He was eventually discharged from hospital with no lasting neurological damage — an outcome his physicians could not account for given the severity of his initial presentation.

The case was submitted to the Vatican's Consulta Medica. After extensive review of the medical record, the board concluded in 2015 that the healing was instantaneous, complete, and medically inexplicable. Pope Francis recognized the miracle, making it the basis for Mother Teresa's canonization on September 4, 2016.

Marcilio and Fernanda Andrino attended the canonization ceremony in Rome, where they met Pope Francis.`,
        has_primary_sources: true,
      },

      // ── Padre Pio ─────────────────────────────────────────────────────────────
      {
        slug: "healing-of-consiglia-de-martino",
        title: "Healing of Consiglia De Martino",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["mothers"],
        date_of_event: "1995-11-03",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Salerno",
        location_lat: "40.682400",
        location_lng: "14.768100",
        country: "Italy",
        region: "Campania",
        recipient_name: "Consiglia De Martino",
        recipient_gender: "female",
        recipient_country: "Italy",
        recipient_privacy: "public",
        medical_diagnosis: "Traumatic rupture of the thoracic duct with accumulation of approximately 2 liters of lymphatic fluid in the neck",
        cure_details:
          "On October 31, 1995, De Martino developed acute pain and a rapidly growing lump below her left collarbone in Salerno. CT scans confirmed a ruptured thoracic duct with approximately 2 liters of lymphatic fluid accumulated in her neck. Complex thoracic surgery was scheduled for November 3. Between November 2 and 3, with no medical treatment administered, the lump disappeared completely. Pre-surgery examination confirmed total resolution; surgery was cancelled. Fra Modestino Fucci had prayed at Padre Pio's tomb on her behalf.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "1998-04-30",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_decree_date: "1998-12-21",
        vatican_medical_board_verdict: "Vatican Medical Committee (5/5) declared healing scientifically inexplicable on April 30, 1998",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Consiglia De Martino was a married woman with three children living in Salerno, Italy. On October 31, 1995, she began to feel acute pain in her chest, followed by the rapid growth of a large mass below her left collarbone. By the time her husband drove her to the Riuniti Hospital in Salerno, the swelling had reached the size of a grapefruit. Physicians ordered two CT scans and confirmed the diagnosis: a traumatic rupture of the thoracic duct, the largest vessel in the lymphatic system. Approximately two liters of lymphatic fluid had accumulated in her neck and chest. Complex thoracic surgery was scheduled for the morning of November 3.

While Consiglia was hospitalized, word was sent to the friary at San Giovanni Rotondo. Fra Modestino Fucci, a Capuchin friar who had known Padre Pio personally, went to pray at his tomb. Consiglia herself prayed to Padre Pio throughout her time in the hospital and reported smelling, on several occasions, the distinctive fragrance that many of Padre Pio's devotees associate with his intercession.

On November 2, she noticed a marked and sudden decrease in pain. The swelling began to diminish. By the morning of November 3, when surgeons arrived to prepare her for the operation, the pre-surgical examination revealed that the lump had disappeared entirely. X-rays confirmed: the thoracic duct rupture had resolved completely, the two liters of lymphatic fluid had been absorbed without trace, and there were no residual deposits in her neck or abdomen. Surgery was cancelled. She was discharged on November 6 without having received any treatment for the condition.

The case was submitted to the Congregation for the Causes of Saints. The diocesan inquiry ran from July 1996 to June 1997, with medical experts unanimously declaring the cure extraordinary and scientifically inexplicable. On April 30, 1998, the Vatican's Medical Committee — five members, voting five to zero — confirmed that the healing was scientifically inexplicable. The Theological Committee unanimously classified it as a miracle on June 22, 1998. Pope John Paul II issued the formal decree on December 21, 1998, and Padre Pio was beatified on May 2, 1999.`,
        has_primary_sources: true,
        published: true,
      },
      {
        slug: "healing-of-matteo-pio-colella",
        title: "Healing of Matteo Pio Colella",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children"],
        date_of_event: "2000-01-20",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "San Giovanni Rotondo",
        location_lat: "41.7069106",
        location_lng: "15.7288455",
        country: "Italy",
        region: "Apulia",
        recipient_name: "Matteo Pio Colella",
        recipient_gender: "male",
        recipient_country: "Italy",
        recipient_privacy: "public",
        recipient_age_at_event: 7,
        medical_diagnosis: "Fulminant meningococcal meningitis with septic shock, cardiac arrest requiring resuscitation, and coma",
        cure_details:
          "On January 20, 2000, seven-year-old Matteo developed high fever, purple spots, and rapidly deteriorated into septic shock with cardiac arrest requiring resuscitation and mechanical ventilation. Physicians stated he would die within hours and last rites were administered. His mother prayed at Padre Pio's nearby tomb. On January 27, Matteo emerged from the coma; a CT scan showed no brain lesions. He was fully recovered by February 6. During the coma he reported seeing an elderly man in a brown habit whom his mother identified as Padre Pio.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "2001-11-22",
        intercessory_medium: "tomb_prayer",
        vatican_recognized: true,
        vatican_decree_date: "2002-02-01",
        vatican_medical_board_verdict: "Vatican Medical Committee unanimously declared healing quick, complete, lasting, without consequences, and scientifically inexplicable (November 22, 2001)",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: `Matteo Pio Colella was born on December 4, 1992, in San Giovanni Rotondo — the town where Padre Pio had lived, and where his tomb now draws pilgrims from around the world. On January 20, 2000, when Matteo was seven years old, he developed a sudden high fever exceeding 104°F, followed by weakness, headache, vomiting, and mental disorientation. Purple spots began to spread across his body — a sign of septicemia. He was rushed to hospital.

His condition deteriorated rapidly. He went into septic shock. His heart stopped and required resuscitation. He was placed on mechanical ventilation and fell into a coma. His organs began to fail. The attending physician told the family that the comatose child would die within hours. Last rites were administered.

His mother, Lucia, left the hospital and walked to the nearby sanctuary of Padre Pio. She knelt at his tomb and prayed.

On January 27 — seven days after the onset of illness — Matteo emerged from the coma. A CT scan performed the same day showed no brain lesions, no neurological damage. He was fully recovered by February 6 and was discharged from hospital without any residual impairment. Doctors who had declared him dying could offer no explanation for what had happened.

During his coma, Matteo later reported, he had seen an elderly man with a white beard dressed in a brown habit who told him he would be well. His mother, when he described the figure, recognized the description immediately as Padre Pio.

The diocesan process opened on June 11, 2000 and concluded on October 17, 2001. On November 22, 2001, the Vatican's Medical Committee unanimously declared the healing quick, complete, lasting, without neurological consequences, and scientifically inexplicable. Pope John Paul II issued the decree in February 2002, and Padre Pio was canonized on June 16, 2002.`,
        has_primary_sources: true,
        published: true,
      },
      {
        slug: "stigmata-of-padre-pio",
        title: "The Stigmata of Padre Pio",
        miracle_category: "associated",
        type: "stigmata",
        topics: [],
        date_of_event: "1918-09-20",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "during_lifetime",
        location_name: "San Giovanni Rotondo",
        location_lat: "41.7069106",
        location_lng: "15.7288455",
        country: "Italy",
        recipient_gender: "not_applicable",
        recipient_privacy: "not_applicable",
        region: "Apulia",
        cure_details:
          "On September 20, 1918, Padre Pio received permanent visible stigmata on his hands, feet, and side while praying in the choir loft after Mass. The wounds bled continuously for fifty years without infection or natural healing, were examined by multiple physicians and Vatican commissions, and disappeared completely at his death on September 23, 1968, leaving no scars. He was the first Catholic priest known to bear the stigmata.",
        cure_characteristics: "not_applicable",
        was_medically_verified: true,
        intercessory_medium: "not_applicable",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Vatican commission (1925) declared wounds not of natural origin; multiple physicians including Dr. Luigi Romanelli and Dr. Giorgio Festa found wounds medically inexplicable",
        used_for_beatification: false,
        used_for_canonization: false,
        synopsis: `On September 20, 1918, Padre Pio was making his thanksgiving after Mass in the choir loft of the Church of Our Lady of Grace in San Giovanni Rotondo. While praying before a crucifix, he fell into a state of ecstasy. When he returned to himself, he found that his hands, feet, and the left side of his chest bore open, bleeding wounds corresponding to the five wounds of Christ's Passion. He had experienced a transient, invisible stigmata two years earlier; this time the wounds were permanent and visible. He would carry them for fifty years, until the day of his death.

The wounds attracted immediate attention from Church authorities and physicians. Dr. Luigi Romanelli, chief surgeon at the hospital in Barletta, examined Padre Pio five times between May 1919 and July 1920. He described the wounds as "deep, bleeding, without infection or signs of healing" and stated: "I cannot find a clinical formulation that allows me to classify these wounds." Dr. Giorgio Festa, examining independently and later alongside Romanelli, found the wounds neither healed nor showed the ordinary signs of tissue decay; he concluded they were not self-inflicted and were medically inexplicable. Over the following decades, additional physicians were dispatched by the Holy Office and by Rome — among them Dr. Amico Bignami and Dr. Agostino Gemelli. No consistent natural explanation emerged from any examination.

The wounds bled continually and were associated with a pronounced floral fragrance that witnesses described as a scent of flowers or incense, which Padre Pio did not use and made no effort to explain. In 1925, a formal Vatican commission examined the stigmata and concluded that the wounds were not of natural origin.

On September 23, 1968 — three days after the fiftieth anniversary of the stigmata — Padre Pio died. At the time of death, witnesses and physicians noted that the wounds on his hands and feet had closed completely and left no scarring, no thickened skin, no residual marks of any kind. Physicians who examined the body found no trace that the wounds had ever existed.

He was the first Catholic priest in the history of the Church known to bear the stigmata.`,
        has_primary_sources: true,
        published: true,
      },
      {
        slug: "bilocation-of-padre-pio",
        title: "Bilocation of Padre Pio",
        miracle_category: "associated",
        type: "bilocation",
        topics: [],
        date_precision: "unknown",
        timing_relative_to_saint_death: "during_lifetime",
        location_name: "San Giovanni Rotondo",
        location_lat: "41.7069106",
        location_lng: "15.7288455",
        country: "Italy",
        region: "Apulia",
        recipient_gender: "not_applicable",
        recipient_privacy: "not_applicable",
        cure_details:
          "Throughout his ministry (1918–1968), Padre Pio was reported by numerous witnesses to appear simultaneously in two locations — physically at San Giovanni Rotondo while being seen elsewhere. Accounts included General Luigi Cadorna (WWI, 1917), American bomber pilots over San Giovanni Rotondo during WWII, and numerous deathbed appearances. Documented in the Vatican Positio for his beatification cause.",
        cure_characteristics: "not_applicable",
        was_medically_verified: false,
        intercessory_medium: "not_applicable",
        vatican_recognized: true,
        used_for_beatification: false,
        used_for_canonization: false,
        synopsis: `Throughout his fifty years at San Giovanni Rotondo, Padre Pio was the subject of numerous accounts in which he was reported to appear simultaneously in two distinct locations — physically present at his friary in Apulia while being seen, heard, or touched by witnesses elsewhere. The accounts span continents and decades, from wartime Europe to the deathbeds of the dying. The phenomenon was documented in the Vatican's Positio — the official dossier prepared for his beatification — and was among the extraordinary events formally considered in his cause for canonization.

Two accounts are among the most frequently cited. The first involves General Luigi Cadorna, Supreme Commander of the Italian Army, on the night of November 9, 1917. Following Italy's catastrophic defeat at Caporetto and his removal from command, Cadorna had locked himself in his quarters in Treviso and was preparing to take his own life. He later reported that a young Capuchin friar entered the room without being admitted, spoke to him, and persuaded him to abandon the act. Three years later, Cadorna visited the friary at San Giovanni Rotondo. When Padre Pio approached, the general recognized him immediately as the friar from that night. Padre Pio reportedly greeted him with: "We had a very bad night that night, General."

The second account comes from World War II. American bomber pilots assigned to strike San Giovanni Rotondo reported that when they arrived over the city, a brown-robed friar appeared in the air before their aircraft and the bombs could not be released. When an American airbase was later established at Foggia, several miles away, one of the pilots visited the friary and identified Padre Pio as the figure he had seen in the sky.

Padre Pio himself rarely spoke of these events and consistently directed the accounts of others away from himself.`,
        has_primary_sources: true,
        published: true,
      },

      // ── Faustina Kowalska ─────────────────────────────────────────────────────
      {
        slug: "healing-of-maureen-digan",
        title: "Healing of Maureen Digan",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["mothers", "elderly"],
        date_of_event: "1981-03-13",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Fall River, Massachusetts",
        location_lat: "41.7010642",
        location_lng: "-71.1546367",
        country: "USA",
        region: "Massachusetts",
        recipient_name: "Maureen Digan",
        recipient_gender: "female",
        recipient_country: "USA",
        recipient_privacy: "public",
        medical_diagnosis: "Lymphedema (chronic, severe leg swelling, unable to walk for 36 years)",
        cure_details:
          "While visiting St. Faustina's tomb in Poland, prayed and felt a cracking sensation. Swelling drained immediately and she could walk.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "1992-01-01",
        intercessory_medium: "tomb_prayer",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable in 1992",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-fr-ronald-pytel",
        title: "Healing of Fr. Ronald Pytel",
        miracle_category: "intercessory",
        type: "healing",
        topics: [],
        date_of_event: "1995-10-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Baltimore, Maryland",
        location_lat: "39.2908816",
        location_lng: "-76.6107590",
        country: "USA",
        region: "Maryland",
        recipient_name: "Fr. Ronald Pytel",
        recipient_gender: "male",
        recipient_country: "Poland",
        recipient_privacy: "public",
        medical_diagnosis: "Advanced arteriosclerosis, severe angina (needed bypass surgery)",
        cure_details:
          "Told he needed bypass surgery. After praying to Faustina, symptoms disappeared and medical tests showed a normal heart.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "1999-01-01",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable in 1999",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },
      {
        slug: "divine-mercy-revelations",
        title: "Divine Mercy Revelations to St. Faustina",
        miracle_category: "associated",
        type: "apparition",
        topics: [],
        date_of_event: "1931-01-01",
        date_precision: "decade",
        timing_relative_to_saint_death: "during_lifetime",
        location_name: "Krakow and Vilnius (convents)",
        location_lat: "50.0469432",
        location_lng: "19.9971534",
        country: "Poland",
        recipient_name: "St. Faustina Kowalska",
        recipient_gender: "female",
        recipient_country: "Poland",
        recipient_privacy: "public",
        cure_details:
          "Multiple visions of Jesus Christ beginning February 22, 1931. Jesus appeared with rays of red and white light, instructing Faustina to have an image painted (\"Jesus, I trust in You\"). Dictated the Chaplet of Divine Mercy and established Divine Mercy Sunday. Faustina recorded everything in her Diary (600+ pages), later approved by the Vatican.",
        cure_characteristics: "not_applicable",
        was_medically_verified: false,
        intercessory_medium: "not_applicable",
        vatican_recognized: true,
        vatican_decree_date: "2000-01-01",
        used_for_beatification: false,
        used_for_canonization: false,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },

      // ── Gianna Beretta Molla ───────────────────────────────────────────────────
      {
        slug: "healing-of-lucia-sylvia-cirilo",
        title: "Healing of Lucia Sylvia Cirilo",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["mothers", "pregnancy-and-childbirth"],
        date_of_event: "1977-11-09",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Saint Francis of Assisi Hospital, Grajau",
        location_lat: "-5.8154034",
        location_lng: "-46.1361454",
        country: "Brazil",
        region: "Maranhao",
        recipient_name: "Lucia Sylvia Cirilo",
        recipient_gender: "female",
        recipient_country: "Brazil",
        recipient_privacy: "public",
        medical_diagnosis: "Recto-vaginal fistula (after stillbirth on October 22, 1977; hospital unequipped to treat)",
        cure_details:
          "After a stillbirth, Cirilo developed a severe recto-vaginal fistula. The hospital could not treat it and she was told she needed to be transferred, but believed she would not survive the trip. A nurse, Sister Bernardina de Manaus, prayed for Gianna's intercession. The next morning, Cirilo's pain had vanished and the fistula had healed completely without surgery.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-elizabeth-comparini-arcolino",
        title: "Healing of Elizabeth Comparini Arcolino",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["pregnancy-and-childbirth", "mothers", "children", "pro-life"],
        date_of_event: "2000-01-01",
        date_precision: "year",
        timing_relative_to_saint_death: "posthumous",
        country: "Brazil",
        recipient_name: "Elizabeth Comparini Arcolino",
        recipient_gender: "female",
        recipient_country: "Brazil",
        recipient_privacy: "public",
        medical_diagnosis:
          "Placental tear at 16 weeks of pregnancy, complete loss of amniotic fluid; doctors said child's survival impossible",
        cure_details:
          "At 16 weeks pregnant, Arcolino sustained a tear in her placenta that drained all amniotic fluid. Doctors told her the child had no chance of survival. She prayed for Gianna's intercession and delivered a healthy baby girl, Gianna Maria, via C-section. The recovery was deemed medically inexplicable.",
        cure_characteristics: "gradual_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },

      // ── Kateri Tekakwitha ─────────────────────────────────────────────────────
      {
        slug: "healing-of-native-american-boy",
        title: "Healing of an Unnamed Native American Boy",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children", "native-and-indigenous"],
        date_of_event: "1940-01-01",
        date_precision: "decade",
        timing_relative_to_saint_death: "posthumous",
        country: "USA",
        recipient_gender: "male",
        recipient_country: "USA",
        recipient_privacy: "confidential",
        medical_diagnosis: "Severe illness (records not publicly detailed)",
        cure_details: "Healed through prayer to Kateri.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: false,
      },
      {
        slug: "healing-of-jake-finkbonner",
        title: "Healing of Jake Finkbonner",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children", "native-and-indigenous"],
        date_of_event: "2006-01-01",
        date_precision: "year",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Ferndale, Washington",
        location_lat: "48.8466698",
        location_lng: "-122.5897230",
        country: "USA",
        region: "Washington",
        recipient_name: "Jake Finkbonner",
        recipient_gender: "male",
        recipient_country: "USA",
        recipient_privacy: "public",
        recipient_age_at_event: 6,
        medical_diagnosis: "Necrotizing fasciitis (flesh-eating bacteria) from facial injury",
        cure_details:
          "Infection spreading rapidly, doctors said he would die or require extensive facial disfigurement. Relic of Kateri applied, prayers offered. Infection stopped, fully recovered without scarring.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "relic",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },
      {
        slug: "vanishing-of-smallpox-scars",
        title: "Vanishing of Smallpox Scars at Death",
        miracle_category: "associated",
        type: "other",
        topics: ["native-and-indigenous"],
        date_of_event: "1680-04-17",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "during_lifetime",
        location_name: "Kahnawake, Quebec",
        location_lat: "45.4147888",
        location_lng: "-73.6773614",
        country: "Canada",
        region: "Quebec",
        recipient_name: "St. Kateri Tekakwitha",
        recipient_gender: "female",
        recipient_country: "Canada",
        recipient_privacy: "public",
        recipient_age_at_event: 24,
        medical_diagnosis:
          "Smallpox scarring (survived epidemic at age 4, left with facial scarring and impaired vision)",
        cure_details:
          "Moments after her death, witnesses observed that the smallpox scars that had marked Kateri's face since childhood completely vanished. Her skin became smooth and beautiful. Witnessed by multiple people present at her deathbed and cited in her canonization process.",
        cure_characteristics: "not_applicable",
        was_medically_verified: false,
        intercessory_medium: "not_applicable",
        vatican_recognized: true,
        used_for_beatification: false,
        used_for_canonization: false,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },

      // ── André Bessette ────────────────────────────────────────────────────────
      {
        slug: "healing-of-giuseppe-carlo-audino",
        published: true,
        title: "Healing of Giuseppe Carlo Audino",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["elderly"],
        date_of_event: "1958-01-01",
        date_precision: "year",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Rochester",
        location_lat: "43.1572850",
        location_lng: "-77.6152140",
        country: "USA",
        region: "New York",
        recipient_name: "Giuseppe Carlo Audino",
        recipient_gender: "male",
        recipient_country: "USA",
        recipient_privacy: "public",
        medical_diagnosis: "Reticulum cell sarcoma (advanced, metastatic — given palliative care only)",
        cure_details:
          "Audino's sarcoma had spread throughout his body, causing massive liver enlargement. Dr. Philip Rubin injected him with radioactive gold intended only to ease suffering. He was cured nearly overnight. Rubin stated: \"There is no clear scientific explanation for his cure.\"",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Giuseppe Carlo Audino was an Italian immigrant living in Rochester, New York. By 1958, he was dying. A diagnosis of reticulum cell sarcoma — an aggressive cancer of the lymphatic system — had reached an advanced, metastatic stage. The disease had spread throughout his body, causing his liver to swell enormously. His physician, Dr. Philip Rubin, chairman of radiation oncology at the University of Rochester Cancer Center, determined that curative treatment was no longer feasible. Audino was given approximately one month to live.

Dr. Rubin proceeded with palliative measures. He injected Audino with radioactive gold — not to arrest the cancer, but to ease his suffering in the time he had remaining. There was no clinical expectation of recovery. Audino's family was preparing for his death.

He had been praying to Brother André for intercession. André Bessette had died in Montreal in 1937, having spent forty years as the doorkeeper of a religious college, directing the sick who came to him toward Saint Joseph. The crutches and canes that lined the walls of his chapel on Mount Royal stood as testimony to thousands who had claimed healing through his prayers. He had never taken credit. "I do not cure," he had said. "Saint Joseph cures."

Nearly overnight, Audino's condition reversed. The tumor disappeared. Dr. Rubin examined him and could not explain what he found. "There is no clear scientific explanation for his cure," Rubin later stated. The man who had been expected to die within weeks was alive and free of the cancer that had been throughout his body.

The Vatican's Consulta Medica reviewed the full record and concluded that the healing was medically inexplicable — spontaneous, complete, and beyond explanation by the natural course of reticulum cell sarcoma or any known effect of the treatment administered. Pope John Paul II recognized the miracle, and it served as the basis for Brother André's beatification on May 23, 1982.

Giuseppe Carlo Audino attended the beatification ceremony in Rome.`,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-child-traumatic-brain-injury",
        published: true,
        title: "Healing of a Child from Traumatic Brain Injury",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children"],
        date_of_event: "1999-01-01",
        date_precision: "year",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Quebec, Canada",
        country: "Canada",
        region: "Quebec",
        recipient_gender: "male",
        recipient_country: "Canada",
        recipient_privacy: "confidential",
        recipient_age_at_event: 9,
        medical_diagnosis:
          "Severe traumatic brain injury from bicycle accident, fell into coma, given little hope of recovery",
        cure_details:
          "A 9-year-old boy was struck by a car while riding his bicycle, sustaining severe cranial trauma and falling into a coma. Physicians assessed the damage as irreversible. Family prayed to Brother André and anointed the boy with oil from the Oratory. He recovered rapidly and completely with no lasting neurological damage.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "blessed_oil",
        vatican_recognized: true,
        vatican_decree_date: "2009-12-19",
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: `In 1999, a nine-year-old boy in Quebec was riding his bicycle when he was struck by a car. The collision caused severe cranial trauma. He was admitted to hospital in critical condition and slipped into a coma. His physicians assessed the brain damage as irreversible. His family was told to prepare for his death.

The boy's relatives prayed to Brother André — the lay brother from Montreal who had been beatified in 1982, and whose Oratory on Mount Royal remained one of the principal Catholic pilgrimage sites in Canada. Following the devotion long associated with Brother André, they also anointed the boy with oil obtained at the Oratory and continued their prayers at his bedside.

The child recovered. Not gradually, in the way that might be attributed to the passage of time and intensive care, but rapidly and completely — in a manner his physicians could not reconcile with the documented severity of the injury. A full neurological recovery from the kind of traumatic brain injury he had sustained was not medically expected. There was no clinical account for what happened.

The case was submitted to a diocesan tribunal in February 2005 — the centenary year of Saint Joseph's Oratory — and referred to the Vatican for formal review. The Consulta Medica, the theologians of the Congregation for the Causes of Saints, and ultimately Pope Benedict XVI all concluded that the healing was scientifically inexplicable and was to be attributed to Brother André's intercession. The decree recognizing the miracle was signed on December 19, 2009. Brother André was canonized by Pope Benedict XVI on October 17, 2010.

The identity of the child has never been publicly disclosed. What is known is that he was a young man from Quebec, and that he was present at the canonization ceremony in St. Peter's Square in Rome in 2010.`,
        has_primary_sources: true,
      },

      // ── Maximilian Kolbe ──────────────────────────────────────────────────────
      // Canonized as martyr — no canonization miracle required; both miracles are for beatification.
      {
        slug: "healing-of-angela-testoni",
        title: "Healing of Angela Testoni",
        miracle_category: "intercessory",
        type: "healing",
        topics: [],
        date_of_event: "1948-07-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        country: "Italy",
        recipient_name: "Angela Testoni",
        recipient_gender: "female",
        recipient_country: "Italy",
        recipient_privacy: "public",
        medical_diagnosis: "Advanced intestinal tuberculosis, considered terminal",
        cure_details:
          "Angela Testoni was cured of advanced intestinal tuberculosis in July 1948 after praying for Maximilian Kolbe's intercession. Her physicians could not explain the resolution of the condition. The cure was accepted as one of two miracles for his beatification.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Angela Testoni was an Italian woman suffering from advanced intestinal tuberculosis — a disease which, in the late 1940s before effective antibiotic therapy was widely available, was frequently fatal once it reached the terminal stage. Her condition was considered beyond the reach of medicine.

Maximilian Kolbe had been dead for seven years. He had died at Auschwitz on August 14, 1941, and word of his sacrifice — volunteering to take the place of a condemned man he did not know — had spread widely among Polish and Italian Catholics in the years following the war. His cause for beatification had been opened, and his intercession was being sought by many.

Angela Testoni prayed for his intercession. In July 1948, her condition resolved in a manner her physicians could not explain. The tuberculosis cleared completely. The Congregation for the Causes of Saints reviewed the case during the investigation into Kolbe's beatification cause. Medical experts examining the documentation declared the healing scientifically inexplicable. It was accepted as one of two miracles supporting Kolbe's beatification.

Maximilian Kolbe was beatified by Pope Paul VI on October 17, 1971. He was initially beatified as a confessor of the faith — a classification Pope John Paul II overturned eleven years later when, at the canonization in 1982, he declared Kolbe a martyr of charity, the first person to be so designated in the modern canonization process.`,
        has_primary_sources: true,
        published: true,
      },
      {
        slug: "healing-of-francis-ranier",
        title: "Healing of Francis Ranier",
        miracle_category: "intercessory",
        type: "healing",
        topics: [],
        date_of_event: "1950-08-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        country: "Italy",
        recipient_name: "Francis Ranier",
        recipient_gender: "male",
        recipient_country: "Italy",
        recipient_privacy: "public",
        medical_diagnosis: "Severe calcification of the arteries (arteriosclerosis)",
        cure_details:
          "Francis Ranier was cured of severe arterial calcification in August 1950 after praying for Maximilian Kolbe's intercession. His physicians declared the resolution of the condition medically inexplicable. The cure was accepted as the second of two miracles for his beatification.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Francis Ranier was an Italian man suffering from severe calcification of the arteries — a condition in which the arterial walls harden and narrow due to calcium deposits, restricting blood flow and placing the patient at high risk of cardiac failure, stroke, and other serious complications. In 1950, treatment options were extremely limited; the condition at the severity Ranier presented was considered irreversible.

Nine years had passed since Maximilian Kolbe's death at Auschwitz, and five years since the end of the war. Kolbe's reputation for heroic sanctity — the Polish Franciscan who had offered his life in place of a stranger — was by then well established across Catholic communities in Europe. His cause for beatification had been opened, and his intercession was being sought by many.

Francis Ranier prayed for Kolbe's intercession. In August 1950, his condition resolved in a manner his physicians declared medically inexplicable. The arterial calcification cleared. The Congregation for the Causes of Saints reviewed the case as part of the beatification process. Medical examiners confirmed the healing could not be accounted for by natural means. It was accepted as the second of the two miracles required for Kolbe's beatification.

Maximilian Kolbe was beatified by Pope Paul VI on October 17, 1971. His canonization followed on October 10, 1982, under Pope John Paul II. Because Kolbe was declared a martyr at canonization, no separate canonization miracle was required — the two beatification miracles of Angela Testoni and Francis Ranier remain the only formally recognized miraculous healings in his cause.`,
        has_primary_sources: true,
        published: true,
      },

      // ── Louis & Zélie Martin ──────────────────────────────────────────────────
      {
        slug: "healing-of-pietro-schiliro",
        title: "Healing of Pietro Schiliro",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children"],
        date_of_event: "2002-06-29",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Monza",
        location_lat: "45.584505",
        location_lng: "9.274247",
        country: "Italy",
        region: "Lombardy",
        recipient_name: "Pietro Schiliro",
        recipient_gender: "male",
        recipient_country: "Italy",
        recipient_privacy: "public",
        recipient_age_at_event: 0,
        medical_diagnosis: "Meconium aspiration syndrome with pulmonary hypertension and multiple pneumothoraces",
        cure_details:
          "Pietro was born on May 25, 2002, at Saint Gérard de Monza hospital. He developed meconium aspiration syndrome, triggering severe pulmonary hypertension and multiple collapsed lungs, and was placed on artificial respiration for forty days. His family prayed a novena to the Venerable Louis and Zélie Martin. On June 29, 2002, his condition began to resolve; he was taken off the respirator on July 3. The Vatican medical commission declared the healing scientifically inexplicable on January 17, 2008.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_decree_date: "2008-01-17",
        vatican_medical_board_verdict: "Declared scientifically inexplicable by the Vatican medical commission",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Pietro Schiliro was born on May 25, 2002, at Saint Gérard de Monza hospital in Monza, near Milan. From the moment of his birth, he was in critical condition. He had inhaled meconium — fetal waste matter — during delivery, causing meconium aspiration syndrome. The condition triggered severe pulmonary hypertension and multiple pneumothoraces, a series of collapsed lungs. He could not breathe on his own. He was placed on artificial respiration and remained between life and death for forty days.

His parents had nowhere medically to turn. Doctors could not predict whether he would survive, and the severity of his pulmonary injury left little room for optimism.

His family turned to prayer. At the time, Louis and Zélie Martin — the parents of Saint Thérèse of Lisieux — were in the late stages of a beatification cause that had been open since 1994. They were not yet blessed; their cause had reached the stage of Venerable. Pietro's family nonetheless offered a novena asking for their intercession.

On June 29, 2002, Pietro's condition began to turn. The pulmonary complications that had been progressive and unresponsive began to resolve. On July 3, he was taken off artificial respiration. His recovery was complete.

The case was submitted to the Vatican's Congregation for the Causes of Saints. On January 17, 2008, the medical commission declared the healing scientifically inexplicable. Pope Benedict XVI formally approved the miracle on July 3, 2008 — exactly six years to the day after Pietro was taken off the respirator — and set October 19, 2008 as the date of beatification for Louis and Zélie Martin.

Pietro, by then six years old, made a pilgrimage of thanksgiving to Lisieux with his family at the end of 2002, and was photographed with the Martin family relics in 2008.`,
        has_primary_sources: true,
        published: true,
      },
      {
        slug: "healing-of-carmen-valencia",
        title: "Healing of Carmen Perez Pons",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children", "mothers"],
        date_of_event: "2008-10-15",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Valencia",
        location_lat: "39.4697065",
        location_lng: "-0.3763353",
        country: "Spain",
        region: "Valencia",
        recipient_name: "Carmen Perez Pons",
        recipient_gender: "female",
        recipient_country: "Spain",
        recipient_privacy: "public",
        recipient_age_at_event: 0,
        medical_diagnosis: "Grade 4 intraventricular hemorrhage (brain hemorrhage) with complications of extreme prematurity (born at approximately 26 weeks)",
        cure_details:
          "Carmen Perez Pons was born in Valencia around October 15, 2008 — approximately four days before the beatification of Louis and Zélie Martin. Born at approximately 26 weeks gestation, she presented with a grade 4 intraventricular hemorrhage, the most severe classification, with outcomes typically fatal or resulting in permanent neurological disability. Barefoot Carmelite nuns at Serra recommended prayers to the newly beatified couple. Over the following weeks, Carmen's condition improved gradually and completely; she was discharged on January 2, 2009. Eight medical experts testified her recovery had no scientific explanation. The Congregation for the Causes of Saints accepted the miracle on March 18, 2015.",
        cure_characteristics: "gradual_complete",
        was_medically_verified: true,
        medical_verification_date: "2013-01-01",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_decree_date: "2015-03-18",
        vatican_medical_board_verdict: "Eight medical experts testified the recovery had no scientific explanation consistent with the severity of the initial presentation",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: `Carmen Perez Pons was born in Valencia, Spain, around October 15, 2008 — approximately four days before the beatification of Louis and Zélie Martin on October 19. She was born extremely prematurely, at approximately twenty-six weeks of gestation, and immediately presented with life-threatening complications. The most severe was a grade 4 intraventricular hemorrhage — bleeding deep within the brain's ventricles, the highest classification of severity. At that grade, outcomes are typically fatal or result in profound and permanent neurological disability. Her physicians did not expect her to survive, and those who did survive such injuries rarely did so without lasting impairment.

Her family, in desperation, reached out to a community of Barefoot Carmelite nuns at Serra, near Valencia. The sisters recommended prayers to the newly beatified Louis and Zélie Martin, whose feast had been celebrated just days before Carmen's birth. The family and the sisters began a novena, asking for their intercession.

Over the weeks that followed, Carmen's condition improved — not in the sudden, overnight reversal that characterizes some miracle cases, but gradually and completely. The hemorrhage resolved. The neurological damage that had been expected did not materialize. She was discharged from hospital on January 2, 2009 — the birthday of Saint Thérèse of Lisieux, the Martins' youngest daughter.

Eight medical experts, as part of the diocesan inquiry opened in 2013, testified that Carmen's recovery had no scientific explanation consistent with the severity of her initial presentation. The Congregation for the Causes of Saints accepted the miracle on March 18, 2015. Louis and Zélie Martin were canonized by Pope Francis on October 18, 2015.

Carmen Perez Pons was present at the canonization ceremony in Rome.`,
        has_primary_sources: true,
        published: true,
      },

      // ── Carlo Acutis ──────────────────────────────────────────────────────────
      {
        slug: "healing-of-matheus",
        title: "Healing of Matheus (Pancreatic Disease)",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children", "youth"],
        date_of_event: "2013-10-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Campo Grande",
        location_lat: "-20.4640173",
        location_lng: "-54.6162947",
        country: "Brazil",
        recipient_name: "Matheus Vianna",
        recipient_gender: "male",
        recipient_country: "Brazil",
        recipient_privacy: "first_name_only",
        medical_diagnosis: "Rare pancreatic disease (possibly annular pancreas)",
        cure_details:
          "Mother prayed to Carlo after learning about his story. Doctors said surgery was only option. Boy recovered spontaneously.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-valeria-valverde",
        title: "Healing of Valeria Valverde",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["youth", "mothers"],
        date_of_event: "2022-07-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Florence",
        location_lat: "43.7697955",
        location_lng: "11.2556404",
        country: "Italy",
        region: "Tuscany",
        recipient_name: "Valeria Valverde",
        recipient_gender: "female",
        recipient_country: "Costa Rica",
        recipient_privacy: "public",
        medical_diagnosis: "Brain haemorrhage from falling off a bicycle; doctors gave low chance of survival",
        cure_details:
          "Mother Lilliana prayed for Carlo's intercession and visited his tomb in Assisi. Same day, Valeria began breathing independently. Next day, she was able to walk with all evidence of the haemorrhage having disappeared.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "tomb_prayer",
        vatican_recognized: true,
        vatican_decree_date: "2024-05-23",
        vatican_medical_board_verdict:
          "Recognized as second miracle by Pope Francis on May 23, 2024; canonized Sept 7, 2025",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },

      // ── Juan Diego ────────────────────────────────────────────────────────────
      {
        slug: "healing-of-juan-jose-barragan-silva",
        title: "Healing of Juan José Barragán Silva",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["addiction", "youth"],
        date_of_event: "1990-05-03",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Queretaro",
        location_lat: "20.8052225",
        location_lng: "-99.8837376",
        country: "Mexico",
        recipient_name: "Juan José Barragán Silva",
        recipient_gender: "male",
        recipient_country: "Mexico",
        recipient_privacy: "public",
        recipient_age_at_event: 20,
        medical_diagnosis:
          "Severe trauma from 10m head-first fall: spinal/neck/cranial fractures, intracranial hemorrhage",
        cure_details:
          "20-year-old drug addict fell 10 meters head-first from an apartment balcony onto cement in an apparent suicide attempt. His mother, who witnessed the fall, invoked Juan Diego. He went into a coma and emerged on May 6 — the same day Pope John Paul II celebrated Juan Diego's beatification. A week later he was sufficiently recovered to be discharged. Five medical consultors unanimously declared the cure medically inexplicable in 1998.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "1998-01-01",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_decree_date: "2001-12-20",
        vatican_medical_board_verdict:
          "5 consultors unanimous medically inexplicable (1998); theological board unanimous (May 2001); decree signed Dec 20, 2001",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },
      {
        slug: "tilma-of-guadalupe",
        title: "The Tilma of Our Lady of Guadalupe",
        miracle_category: "associated",
        type: "miraculous_image",
        topics: ["native-and-indigenous"],
        date_of_event: "1531-12-09",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "during_lifetime",
        location_name: "Tepeyac Hill",
        location_lat: "19.4848583",
        location_lng: "-99.1178571",
        country: "Mexico",
        region: "Mexico City",
        recipient_gender: "not_applicable",
        recipient_privacy: "not_applicable",
        cure_details:
          "Our Lady appeared to Juan Diego. Bishop demanded a sign. Juan Diego gathered Castilian roses (out of season) in his tilma. When opened before the bishop, the image of Our Lady was miraculously imprinted on the fabric.",
        cure_characteristics: "not_applicable",
        was_medically_verified: false,
        intercessory_medium: "not_applicable",
        vatican_recognized: true,
        used_for_beatification: false,
        used_for_canonization: false,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },
    ])
    .returning({ id: schema.miracles.id, slug: schema.miracles.slug });

  console.log(`Inserted ${insertedMiracles.length} miracles.`);

  const miracleId = (slug: string) => {
    const m = insertedMiracles.find((r) => r.slug === slug);
    if (!m) throw new Error(`Miracle not found: ${slug}`);
    return m.id;
  };

  console.log("Seeding miracle saints...");

  await db.insert(schema.miracleSaints).values([
    // John Paul II
    { miracle_id: miracleId("healing-of-sr-marie-simon-pierre"), saint_id: saintId("john-paul-ii") },
    { miracle_id: miracleId("healing-of-floribeth-mora-diaz"), saint_id: saintId("john-paul-ii") },
    // Mother Teresa
    { miracle_id: miracleId("healing-of-monica-besra"), saint_id: saintId("mother-teresa") },
    { miracle_id: miracleId("healing-of-marcilio-haddad-andrino"), saint_id: saintId("mother-teresa") },
    // Padre Pio
    { miracle_id: miracleId("healing-of-consiglia-de-martino"), saint_id: saintId("padre-pio") },
    { miracle_id: miracleId("healing-of-matteo-pio-colella"), saint_id: saintId("padre-pio") },
    { miracle_id: miracleId("stigmata-of-padre-pio"), saint_id: saintId("padre-pio") },
    { miracle_id: miracleId("bilocation-of-padre-pio"), saint_id: saintId("padre-pio") },
    // Faustina Kowalska
    { miracle_id: miracleId("healing-of-maureen-digan"), saint_id: saintId("faustina-kowalska") },
    { miracle_id: miracleId("healing-of-fr-ronald-pytel"), saint_id: saintId("faustina-kowalska") },
    { miracle_id: miracleId("divine-mercy-revelations"), saint_id: saintId("faustina-kowalska") },
    // Gianna Beretta Molla
    { miracle_id: miracleId("healing-of-lucia-sylvia-cirilo"), saint_id: saintId("gianna-beretta-molla") },
    { miracle_id: miracleId("healing-of-elizabeth-comparini-arcolino"), saint_id: saintId("gianna-beretta-molla") },
    // Kateri Tekakwitha
    { miracle_id: miracleId("healing-of-native-american-boy"), saint_id: saintId("kateri-tekakwitha") },
    { miracle_id: miracleId("healing-of-jake-finkbonner"), saint_id: saintId("kateri-tekakwitha") },
    { miracle_id: miracleId("vanishing-of-smallpox-scars"), saint_id: saintId("kateri-tekakwitha") },
    // Andre Bessette
    { miracle_id: miracleId("healing-of-giuseppe-carlo-audino"), saint_id: saintId("andre-bessette") },
    { miracle_id: miracleId("healing-of-child-traumatic-brain-injury"), saint_id: saintId("andre-bessette") },
    // Maximilian Kolbe
    { miracle_id: miracleId("healing-of-angela-testoni"), saint_id: saintId("maximilian-kolbe") },
    { miracle_id: miracleId("healing-of-francis-ranier"), saint_id: saintId("maximilian-kolbe") },
    // Louis & Zélie Martin — both miracles attributed to both saints jointly
    { miracle_id: miracleId("healing-of-pietro-schiliro"), saint_id: saintId("louis-martin") },
    { miracle_id: miracleId("healing-of-pietro-schiliro"), saint_id: saintId("zelie-martin") },
    { miracle_id: miracleId("healing-of-carmen-valencia"), saint_id: saintId("louis-martin") },
    { miracle_id: miracleId("healing-of-carmen-valencia"), saint_id: saintId("zelie-martin") },
    // Carlo Acutis
    { miracle_id: miracleId("healing-of-matheus"), saint_id: saintId("carlo-acutis") },
    { miracle_id: miracleId("healing-of-valeria-valverde"), saint_id: saintId("carlo-acutis") },
    // Juan Diego
    { miracle_id: miracleId("healing-of-juan-jose-barragan-silva"), saint_id: saintId("juan-diego") },
    { miracle_id: miracleId("tilma-of-guadalupe"), saint_id: saintId("juan-diego") },
  ]);

  console.log("Seeding miracle sources...");

  await db.insert(schema.miracleSources).values([
    // John Paul II - M1
    {
      miracle_id: miracleId("healing-of-sr-marie-simon-pierre"),
      url: "https://www.catholicnewsagency.com/news/the-miracle-that-led-to-john-paul-ii-beatification-12766",
      title: "The miracle that led to John Paul II's beatification - CNA",
      source_type: "news_article",
    },
    // John Paul II - M2
    {
      miracle_id: miracleId("healing-of-floribeth-mora-diaz"),
      url: "https://www.ewtnnews.com/world/europe/woman-healed-by-john-paul-iis-intercession-recounts-miracle",
      title: "Woman healed by John Paul II's intercession recounts miracle - EWTN News",
      source_type: "news_article",
    },
    // Mother Teresa - M1
    {
      miracle_id: miracleId("healing-of-monica-besra"),
      url: "https://www.ewtnnews.com/world/europe/i-was-sure-that-it-was-mother-teresa-who-healed-me",
      title: "'I was sure that it was Mother Teresa who healed me' - EWTN News",
      source_type: "news_article",
    },
    // Padre Pio - M2
    {
      miracle_id: miracleId("healing-of-matteo-pio-colella"),
      url: "https://www.catholicnewsagency.com/news/39950/young-man-healed-by-padre-pio-recounts-story-of-miraculous-cure",
      title: "Young man healed by Padre Pio recounts story of miraculous cure - EWTN News",
      source_type: "news_article",
    },
    // Faustina Kowalska - M1
    {
      miracle_id: miracleId("healing-of-maureen-digan"),
      url: "https://www.ncregister.com/blog/divine-mercy-and-the-digans",
      title: "The Miraculous Cure That Got Sister Faustina Beatified - National Catholic Register",
      source_type: "news_article",
    },
    // Kateri Tekakwitha - M2
    {
      miracle_id: miracleId("healing-of-jake-finkbonner"),
      url: "https://www.ncregister.com/news/pope-approves-miracle-of-kateri-tekakwitha",
      title: "Pope Approves Miracle of Kateri Tekakwitha - National Catholic Register",
      source_type: "news_article",
    },
    // Andre Bessette - M2
    {
      miracle_id: miracleId("healing-of-child-traumatic-brain-injury"),
      url: "https://www.catholicnewsagency.com/search?q=Andre+Bessette+canonization+miracle",
      title: "CNA articles on Andre Bessette canonization miracle",
      source_type: "news_article",
    },
    // Carlo Acutis - M2
    {
      miracle_id: miracleId("healing-of-valeria-valverde"),
      url: "https://www.ewtnnews.com/vatican/carlo-acutis-to-be-first-millennial-saint-pope-francis-recognizes-miracle-for-canonization",
      title: "Carlo Acutis to be first millennial saint: Pope Francis recognizes miracle for canonization - EWTN News",
      source_type: "news_article",
    },
  ]);

  console.log("Seeding saint sources...");

  await db.insert(schema.saintSources).values([
    // John Paul II
    {
      saint_id: saintId("john-paul-ii"),
      url: "https://www.vatican.va/content/francesco/en/homilies/2014/documents/papa-francesco_20140427_omelia-canonizzazioni.html",
      title: "Holy Mass and Canonization of Blesseds John XXIII and John Paul II - Homily of Pope Francis",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("john-paul-ii"),
      url: "https://www.jp2shrine.org/",
      title: "Saint John Paul II National Shrine - Official Site",
      source_type: "other",
    },
    // Mother Teresa
    {
      saint_id: saintId("mother-teresa"),
      url: "https://www.vatican.va/content/francesco/en/homilies/2016/documents/papa-francesco_20160904_omelia-canonizzazione-madre-teresa.html",
      title: "Holy Mass and Canonization of Mother Teresa of Calcutta - Homily of Pope Francis",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("mother-teresa"),
      url: "https://www.motherteresa.org/",
      title: "Mother Teresa Center - Official Site of the Missionaries of Charity",
      source_type: "other",
    },
    // Padre Pio
    {
      saint_id: saintId("padre-pio"),
      url: "https://www.vatican.va/content/john-paul-ii/en/homilies/2002/documents/hf_jp-ii_hom_20020616_padre-pio.html",
      title: "Canonization of Padre Pio of Pietrelcina - Homily of Pope John Paul II",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("padre-pio"),
      url: "https://www.santuariopadrepio.it/",
      title: "Padre Pio Shrine, San Giovanni Rotondo - Official Site",
      source_type: "other",
    },
    // Faustina Kowalska
    {
      saint_id: saintId("faustina-kowalska"),
      url: "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20000430_faustina_en.html",
      title: "Canonization of St. Faustina Kowalska - Vatican Liturgy Page",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("faustina-kowalska"),
      url: "https://www.faustyna.pl/",
      title: "Divine Mercy Sanctuary, Krakow-Lagiewniki - Official Site",
      source_type: "other",
    },
    // Gianna Beretta Molla
    {
      saint_id: saintId("gianna-beretta-molla"),
      url: "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20040516_beretta-molla_en.html",
      title: "Canonization of St. Gianna Beretta Molla - Vatican Liturgy Page",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("gianna-beretta-molla"),
      url: "https://www.vatican.va/content/john-paul-ii/en/homilies/2004/documents/hf_jp-ii_hom_20040516_canonizations.html",
      title: "Canonization of Gianna Beretta Molla - Homily of Pope John Paul II",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("gianna-beretta-molla"),
      url: "https://en.wikipedia.org/wiki/Gianna_Beretta_Molla",
      title: "Gianna Beretta Molla - Wikipedia",
      source_type: "academic",
    },
    // Kateri Tekakwitha
    {
      saint_id: saintId("kateri-tekakwitha"),
      url: "https://www.vatican.va/content/benedict-xvi/en/homilies/2012/documents/hf_ben-xvi_hom_20121021_canonizzazioni.html",
      title: "Canonization of Kateri Tekakwitha and others - Homily of Pope Benedict XVI",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("kateri-tekakwitha"),
      url: "https://www.katerishrine.com/",
      title: "National Shrine of St. Kateri Tekakwitha, Fonda, NY",
      source_type: "other",
    },
    // Andre Bessette
    {
      saint_id: saintId("andre-bessette"),
      url: "https://www.vatican.va/content/benedict-xvi/en/homilies/2010/documents/hf_ben-xvi_hom_20101017_canonizations.html",
      title: "Canonization of Andre Bessette and others - Homily of Pope Benedict XVI",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("andre-bessette"),
      url: "https://www.saint-joseph.org/",
      title: "St. Joseph's Oratory of Mount Royal - Official Site",
      source_type: "other",
    },
    {
      saint_id: saintId("andre-bessette"),
      url: "https://en.wikipedia.org/wiki/Andre_Bessette",
      title: "Andre Bessette - Wikipedia",
      source_type: "academic",
    },
    // Maximilian Kolbe
    {
      saint_id: saintId("maximilian-kolbe"),
      url: "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_19821010_massimiliano_kolbe_it.html",
      title: "Canonization of St. Maximilian Kolbe - Vatican Liturgy Page (Italian)",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("maximilian-kolbe"),
      url: "https://saintmaximiliankolbe.com/",
      title: "St. Maximilian Kolbe - Official Apostolate Site",
      source_type: "other",
    },
    {
      saint_id: saintId("maximilian-kolbe"),
      url: "https://en.wikipedia.org/wiki/Maximilian_Kolbe",
      title: "Maximilian Kolbe - Wikipedia",
      source_type: "academic",
    },
    // Louis Martin
    {
      saint_id: saintId("louis-martin"),
      url: "https://www.vatican.va/content/francesco/en/homilies/2015/documents/papa-francesco_20151018_omelia-canonizzazioni.html",
      title: "Canonization of Louis and Zelie Martin and others - Homily of Pope Francis",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("louis-martin"),
      url: "https://www.thereseoflisieux.org/",
      title: "Sanctuary of St. Therese and the Martin Family, Lisieux - Official Site",
      source_type: "other",
    },
    {
      saint_id: saintId("louis-martin"),
      url: "https://sanctuaire-louisetzelie.com/en/",
      title: "Sanctuary of Louis and Zélie Martin, Alençon - Official Site",
      source_type: "other",
    },
    {
      saint_id: saintId("louis-martin"),
      url: "https://en.wikipedia.org/wiki/Louis_Martin_and_Marie-Azelie_Guerin",
      title: "Louis Martin and Marie-Azelie Guerin - Wikipedia",
      source_type: "academic",
    },
    // Zelie Martin
    {
      saint_id: saintId("zelie-martin"),
      url: "https://www.vatican.va/content/francesco/en/homilies/2015/documents/papa-francesco_20151018_omelia-canonizzazioni.html",
      title: "Canonization of Louis and Zelie Martin and others - Homily of Pope Francis",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("zelie-martin"),
      url: "https://www.thereseoflisieux.org/",
      title: "Sanctuary of St. Therese and the Martin Family, Lisieux - Official Site",
      source_type: "other",
    },
    {
      saint_id: saintId("zelie-martin"),
      url: "https://sanctuaire-louisetzelie.com/en/",
      title: "Sanctuary of Louis and Zélie Martin, Alençon - Official Site",
      source_type: "other",
    },
    {
      saint_id: saintId("zelie-martin"),
      url: "https://en.wikipedia.org/wiki/Louis_Martin_and_Marie-Azelie_Guerin",
      title: "Louis Martin and Marie-Azelie Guerin - Wikipedia",
      source_type: "academic",
    },
    // Carlo Acutis
    {
      saint_id: saintId("carlo-acutis"),
      url: "https://www.carloacutis.com/",
      title: "Associazione Amici di Carlo Acutis - Official Site",
      source_type: "other",
    },
    // Juan Diego
    {
      saint_id: saintId("juan-diego"),
      url: "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20020731_juan-diego_en.html",
      title: "Canonization of St. Juan Diego - Vatican Liturgy Page",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("juan-diego"),
      url: "https://en.wikipedia.org/wiki/Juan_Diego",
      title: "Juan Diego - Wikipedia",
      source_type: "academic",
    },
    {
      saint_id: saintId("juan-diego"),
      url: "https://virgendeguadalupe.mx/",
      title: "Basilica of Our Lady of Guadalupe - Official Site",
      source_type: "other",
    },
  ]);

  console.log("Seeding saint locations...");

  await db.insert(schema.saintLocations).values([
    // John Paul II
    { saint_id: saintId("john-paul-ii"), location_name: "Wadowice, Poland", lat: "49.883333", lng: "19.483333", location_type: "birthplace" },
    { saint_id: saintId("john-paul-ii"), location_name: "Vatican City (St. Peter's Basilica)", lat: "41.902200", lng: "12.453400", location_type: "tomb" },
    { saint_id: saintId("john-paul-ii"), location_name: "Vatican City", lat: "41.902200", lng: "12.453400", location_type: "death_place" },
    { saint_id: saintId("john-paul-ii"), location_name: "Sanctuary of St. John Paul II, Krakow, Poland", lat: "50.005200", lng: "19.974200", location_type: "shrine" },
    { saint_id: saintId("john-paul-ii"), location_name: "Divine Mercy Sanctuary, Krakow, Poland (relic)", lat: "50.054700", lng: "19.935100", location_type: "relic" },

    // Mother Teresa
    { saint_id: saintId("mother-teresa"), location_name: "Skopje, North Macedonia", lat: "42.000000", lng: "21.433333", location_type: "birthplace" },
    { saint_id: saintId("mother-teresa"), location_name: "Mother House of the Missionaries of Charity, Kolkata, India", lat: "22.544800", lng: "88.354200", location_type: "tomb" },
    { saint_id: saintId("mother-teresa"), location_name: "Mother House of the Missionaries of Charity, Kolkata, India", lat: "22.544800", lng: "88.354200", location_type: "death_place" },
    { saint_id: saintId("mother-teresa"), location_name: "Basilica of the Sacred Heart, Kolkata, India", lat: "22.544800", lng: "88.354200", location_type: "shrine" },

    // Padre Pio
    { saint_id: saintId("padre-pio"), location_name: "Pietrelcina, Benevento, Italy", lat: "41.200000", lng: "14.850000", location_type: "birthplace" },
    { saint_id: saintId("padre-pio"), location_name: "San Giovanni Rotondo, Foggia, Italy", lat: "41.705800", lng: "15.727800", location_type: "tomb" },
    { saint_id: saintId("padre-pio"), location_name: "San Giovanni Rotondo, Foggia, Italy", lat: "41.705800", lng: "15.727800", location_type: "death_place" },
    { saint_id: saintId("padre-pio"), location_name: "Our Lady of Grace Capuchin Church, San Giovanni Rotondo", lat: "41.705800", lng: "15.727800", location_type: "shrine" },

    // Faustina Kowalska
    { saint_id: saintId("faustina-kowalska"), location_name: "Glogowiec, Poland", lat: "52.050000", lng: "18.900000", location_type: "birthplace" },
    { saint_id: saintId("faustina-kowalska"), location_name: "Divine Mercy Sanctuary, Krakow-Lagiewniki, Poland", lat: "50.054700", lng: "19.935100", location_type: "tomb" },
    { saint_id: saintId("faustina-kowalska"), location_name: "Krakow, Poland", lat: "50.054700", lng: "19.935100", location_type: "death_place" },
    { saint_id: saintId("faustina-kowalska"), location_name: "Divine Mercy Sanctuary, Krakow-Lagiewniki, Poland", lat: "50.054700", lng: "19.935100", location_type: "shrine" },

    // Gianna Beretta Molla
    { saint_id: saintId("gianna-beretta-molla"), location_name: "Magenta, Milan, Italy", lat: "45.466667", lng: "8.883333", location_type: "birthplace" },
    { saint_id: saintId("gianna-beretta-molla"), location_name: "Monza, Italy", lat: "45.583333", lng: "9.266667", location_type: "death_place" },
    { saint_id: saintId("gianna-beretta-molla"), location_name: "Mesero Cemetery, Mesero, Italy", lat: "45.500000", lng: "8.850000", location_type: "tomb" },
    { saint_id: saintId("gianna-beretta-molla"), location_name: "Sanctuary of Santa Maria Nascente, Ponte Lambro, Italy", lat: "45.833333", lng: "9.216667", location_type: "shrine" },

    // Kateri Tekakwitha
    { saint_id: saintId("kateri-tekakwitha"), location_name: "Ossernenon (Auriesville, New York, USA)", lat: "42.983333", lng: "-74.316667", location_type: "birthplace" },
    { saint_id: saintId("kateri-tekakwitha"), location_name: "Kahnawake, Quebec, Canada", lat: "45.416667", lng: "-73.583333", location_type: "death_place" },
    { saint_id: saintId("kateri-tekakwitha"), location_name: "St. Francis Xavier Mission, Kahnawake, Quebec, Canada", lat: "45.416667", lng: "-73.583333", location_type: "tomb" },
    { saint_id: saintId("kateri-tekakwitha"), location_name: "St. Kateri National Shrine, Auriesville, New York, USA", lat: "42.983333", lng: "-74.316667", location_type: "shrine" },
    { saint_id: saintId("kateri-tekakwitha"), location_name: "St. Kateri Shrine, Fonda, New York, USA", lat: "42.950000", lng: "-74.383333", location_type: "shrine" },

    // Andre Bessette
    { saint_id: saintId("andre-bessette"), location_name: "Mont-Saint-Gregoire, Quebec, Canada", lat: "45.366667", lng: "-73.150000", location_type: "birthplace" },
    { saint_id: saintId("andre-bessette"), location_name: "St. Joseph's Oratory, Montreal, Quebec, Canada", lat: "45.491600", lng: "-73.622200", location_type: "tomb" },
    { saint_id: saintId("andre-bessette"), location_name: "St. Joseph's Oratory, Montreal, Quebec, Canada", lat: "45.491600", lng: "-73.622200", location_type: "death_place" },
    { saint_id: saintId("andre-bessette"), location_name: "St. Joseph's Oratory, Montreal, Quebec, Canada", lat: "45.491600", lng: "-73.622200", location_type: "shrine" },

    // Maximilian Kolbe
    { saint_id: saintId("maximilian-kolbe"), location_name: "Zdunska Wola, Poland", lat: "51.600000", lng: "18.933333", location_type: "birthplace" },
    { saint_id: saintId("maximilian-kolbe"), location_name: "Auschwitz-Birkenau, Poland", lat: "50.033333", lng: "19.183333", location_type: "death_place" },
    { saint_id: saintId("maximilian-kolbe"), location_name: "Basilica of St. Maximilian Kolbe, Niepokalanow, Poland", lat: "52.233333", lng: "20.316667", location_type: "tomb" },
    { saint_id: saintId("maximilian-kolbe"), location_name: "Auschwitz-Birkenau, Poland", lat: "50.033333", lng: "19.183333", location_type: "shrine" },
    { saint_id: saintId("maximilian-kolbe"), location_name: "Niepokalanow Monastery, Poland", lat: "52.233333", lng: "20.316667", location_type: "shrine" },

    // Louis Martin
    { saint_id: saintId("louis-martin"), location_name: "Bordeaux, France", lat: "44.833333", lng: "-0.566667", location_type: "birthplace" },
    { saint_id: saintId("louis-martin"), location_name: "Alencon, France", lat: "48.433333", lng: "0.083333", location_type: "death_place" },
    { saint_id: saintId("louis-martin"), location_name: "Basilica of St. Therese, Lisieux, France", lat: "49.050000", lng: "0.233333", location_type: "tomb" },
    { saint_id: saintId("louis-martin"), location_name: "Alencon, France (family home)", lat: "48.433333", lng: "0.083333", location_type: "shrine" },

    // Zelie Martin
    { saint_id: saintId("zelie-martin"), location_name: "Gandelain, France", lat: "48.483333", lng: "-0.033333", location_type: "birthplace" },
    { saint_id: saintId("zelie-martin"), location_name: "Alencon, France", lat: "48.433333", lng: "0.083333", location_type: "death_place" },
    { saint_id: saintId("zelie-martin"), location_name: "Basilica of St. Therese, Lisieux, France", lat: "49.050000", lng: "0.233333", location_type: "tomb" },
    { saint_id: saintId("zelie-martin"), location_name: "Alencon, France (family home)", lat: "48.433333", lng: "0.083333", location_type: "shrine" },

    // Carlo Acutis
    { saint_id: saintId("carlo-acutis"), location_name: "London, England", lat: "51.507400", lng: "-0.127800", location_type: "birthplace" },
    { saint_id: saintId("carlo-acutis"), location_name: "Monza, Italy", lat: "45.583333", lng: "9.266667", location_type: "death_place" },
    { saint_id: saintId("carlo-acutis"), location_name: "Sanctuary of the Spoliation, Assisi, Italy", lat: "43.066667", lng: "12.616667", location_type: "tomb" },
    { saint_id: saintId("carlo-acutis"), location_name: "Assisi, Italy", lat: "43.066667", lng: "12.616667", location_type: "shrine" },
    { saint_id: saintId("carlo-acutis"), location_name: "Santa Maria Maggiore, Rome, Italy (first-class relic)", lat: "41.897500", lng: "12.498900", location_type: "relic" },

    // Juan Diego
    { saint_id: saintId("juan-diego"), location_name: "Cuauhtitlan, Mexico", lat: "19.683333", lng: "-99.183333", location_type: "birthplace" },
    { saint_id: saintId("juan-diego"), location_name: "Tepeyac Hill, Mexico City, Mexico", lat: "19.484400", lng: "-99.117500", location_type: "death_place" },
    { saint_id: saintId("juan-diego"), location_name: "Basilica of Our Lady of Guadalupe, Mexico City", lat: "19.484400", lng: "-99.117500", location_type: "tomb" },
    { saint_id: saintId("juan-diego"), location_name: "Basilica of Our Lady of Guadalupe, Mexico City", lat: "19.484400", lng: "-99.117500", location_type: "shrine" },
  ]);

  console.log("Seeding complete.");
  console.log(`  Saints: ${insertedSaints.length}`);
  console.log("  Saint relations: 2");
  console.log(`  Miracles: ${insertedMiracles.length}`);
  console.log("  Miracle sources: 8");
  console.log("  Saint sources: 31");
  console.log("  Saint locations: 50");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
