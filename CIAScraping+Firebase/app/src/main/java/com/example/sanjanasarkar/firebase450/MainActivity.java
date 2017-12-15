package com.example.sanjanasarkar.firebase450;

import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.io.*;
import java.util.*;

import org.jsoup.Jsoup;
import org.jsoup.nodes.*;
import org.jsoup.select.*;
/*
* @author: Sanjana Sarkar
*/
public class MainActivity extends AppCompatActivity {
    Document doc;
    private String htmlContentInStringFormat;
    private static String baseURL = "https://www.cia.gov/library/publications/the-world-factbook/";
    private static Map<String, String> countryToUrl = new HashMap<>();
    private static Map<String, Integer> countryToPop = new HashMap<>();
    private static Map<String, String> countryToGDP = new HashMap<>();
    private static Map<String, String> countryToArea = new HashMap<>();
    private static Map<String, String> countryToGov = new HashMap<>();
    private static Map<String, String> countryToUnem = new HashMap<>();

    private static void getURLS() {
        try {
            Document doc = Jsoup.connect(baseURL).get();
            Elements urls = doc.getElementsByAttributeValue("action", "\"#\"");
            for(Element e: urls) {
                Elements options = e.getElementsByTag("option");
                int i = 0;
                for (Element op : options) {
                    if (i == 0 || i == 1) {
                        i++;
                        continue;
                    }
                    Elements opUrl = op.getElementsByAttribute("value");
                    if (opUrl.text().contains("Ocean") || opUrl.text().equals("United States Pacific Island Wildlife Refuges")
                            ||  opUrl.text().equals("European Union")) {
                        continue;
                    }

                    if (opUrl.text().contains("Micronesia")) {
                        countryToUrl.put("Micronesia", baseURL + opUrl.attr("value"));
                        continue;
                    }

                    if (opUrl.text().contains("Bahamas")) {
                        countryToUrl.put("The Bahamas", baseURL + opUrl.attr("value"));
                        continue;
                    }

                    System.out.println(opUrl.text());
                    System.out.println(opUrl.attr("value"));
                    countryToUrl.put(opUrl.text(), baseURL + opUrl.attr("value"));
                }
                i = 0;
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void fillPopulation() throws IOException {
        for (String country : countryToUrl.keySet()) {
            System.out.println(country);
            Document doc = Jsoup.connect(countryToUrl.get(country)).get();
            Elements divs = doc.getElementsByTag("div");
            int i = 0;
            for (Element d : divs) {
                if (i > 0) {
                    int population = getPopulation(d.text());

                    if (population != 0) {
                        System.out.println(population);
                        countryToPop.put(country, population);
                    }
                    break;
                }

                if (d.text().equals("Population:")) {
                    i++;
                    continue;
                }
            }
        }
    }

    private static int getPopulation(String s) {
        Scanner sc = new Scanner(s);

        if (s.contains("million")) {
            if (sc.hasNextDouble()) {
                return (int) (sc.nextDouble() * 1000000);
            }
        }

        if (s.contains("billion")) {
            if (sc.hasNextDouble()) {
                return (int) (sc.nextDouble() * 1000000000);
            }
        }

        if (sc.hasNextInt()) {
            return sc.nextInt();
        }

        return 0;
    }


    private static void fillGDP() throws IOException {
        for (String country : countryToPop.keySet()) {
            System.out.println(country);
            String url = countryToUrl.get(country);

            Document doc = Jsoup.connect(url).get();
            Elements divs = doc.getElementsByTag("div");
            int i = 0;
            for (Element d : divs) {
                if (i > 0) {
                    if (d.text().contains("NA")) {
                        countryToGDP.put(country, "0");
                    } else {
                        countryToGDP.put(country, getGDP(d.text()));
                    }
                    break;
                }

                if (d.text().equals("GDP (purchasing power parity):")) {
                    i++;
                    continue;
                }
            }
        }
    }


    private static String getGDP(String s) {
        Scanner sc = new Scanner(s.substring(s.indexOf("$") + 1));
        s = s.substring(s.indexOf("$") + 1);

        if (s.contains("(")) {
            return s.substring(0, s.indexOf("(") - 1);
        }
        return s;
    }


    private static void fillArea() throws IOException {
        for (String country : countryToPop.keySet()) {
            System.out.println(country);
            String url = countryToUrl.get(country);
            Document doc = Jsoup.connect(url).get();
            Elements divs = doc.getElementsByTag("div");
            int i = 0;
            for (Element d : divs) {
                if (i > 0) {
                    countryToArea.put(country, getArea(d.text()));
                    break;
                }

                if (d.text().equals("Area:")) {
                    i++;
                    continue;
                }
            }
        }
    }

    private static String getArea(String s) {
        return s.substring(s.indexOf(":") + 2, s.indexOf("km") + 2);
    }

    private static void fillGovernment() throws IOException {
        for (String country : countryToPop.keySet()) {
            System.out.println(country);
            String url = countryToUrl.get(country);
            Document doc = Jsoup.connect(url).get();
            Elements divs = doc.getElementsByTag("div");
            int i = 0;
            for (Element d : divs) {
                if (i > 0) {
                    countryToGov.put(country, d.text());
                    break;
                }

                if (d.text().equals("Government type:")) {
                    i++;
                    continue;
                }
            }
        }
    }

    private static void fillUnemployment() throws IOException {
        for (String country : countryToPop.keySet()) {
            System.out.println(country);
            String url = countryToUrl.get(country);
            Document doc = Jsoup.connect(url).get();
            Elements divs = doc.getElementsByTag("div");
            int i = 0;
            for (Element d : divs) {
                if (i > 0) {
                    countryToUnem.put(country, getUnem(d.text()));
                    break;
                }

                if (d.text().equals("Unemployment rate:")) {
                    i++;
                    continue;
                }
            }
        }
    }

    private static String getUnem(String s) {
        return s.substring(0, s.indexOf("%") + 1);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);


        JsoupAsyncTask jsoupAsyncTask = new JsoupAsyncTask();
        jsoupAsyncTask.execute();
        setContentView(R.layout.activity_main);
    }
    
    // async task to seed Firebase db
    private class JsoupAsyncTask extends AsyncTask<Void, Void, Void> {

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected Void doInBackground(Void... params) {
            getURLS();
            try {
                fillPopulation();
            } catch (IOException e) {
                e.printStackTrace();
            }

            try {
                fillGDP();
            } catch (IOException e) {
                e.printStackTrace();
            }

            try {
                fillArea();
            } catch (IOException e) {
                e.printStackTrace();
            }


            try {
                fillGovernment();
            } catch (IOException e) {
                e.printStackTrace();
            }

            try {
                fillUnemployment();
            } catch (IOException e) {
                e.printStackTrace();
            }

            return null;
        }
    
        // pushing to Firebase
        @Override
        protected void onPostExecute(Void result) {
            FirebaseDatabase database = FirebaseDatabase.getInstance();
            DatabaseReference popRef = database.getReference("Population");
            popRef.setValue(countryToPop);

            DatabaseReference gdpRef = database.getReference("GDP");
            gdpRef.setValue(countryToGDP);

            DatabaseReference govRef = database.getReference("Government");
            govRef.setValue(countryToGov);

            DatabaseReference areaRef = database.getReference("Area");
            areaRef.setValue(countryToArea);

            DatabaseReference unemRef = database.getReference("Unemployment");
            unemRef.setValue(countryToUnem);

            System.out.println("DONE");
        }
    }
}
