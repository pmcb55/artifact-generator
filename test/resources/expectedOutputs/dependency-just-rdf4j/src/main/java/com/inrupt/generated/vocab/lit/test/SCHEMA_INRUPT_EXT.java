/**
 * Generated by the artifact generator [@inrupt/lit-artifact-generator], version [0.10.29]
 * as part of artifact: [generated-vocab-TEST], version: [0.1.5-SNAPSHOT]
 * on 'Saturday, July 18, 2020 8:52 PM'.
 *
 * Vocabulary built from vocab list file: [./test/resources/yamlConfig/vocab-rdf-library-java-rdf4j.yml].
 */
package com.inrupt.generated.vocab.lit.test;

import org.eclipse.rdf4j.model.IRI;
import org.eclipse.rdf4j.model.Namespace;
import org.eclipse.rdf4j.model.ValueFactory;
import org.eclipse.rdf4j.model.impl.SimpleNamespace;
import org.eclipse.rdf4j.model.impl.SimpleValueFactory;

/**
 * Extension to Schema.org terms providing multilingual alternative names and translations for comments (e.g. for use directly as labels or tool-tips in user interfaces or error messages)
 */
public class SCHEMA_INRUPT_EXT {
    public static final String PREFIX = "schema-inrupt-ext";
    public static final String NAMESPACE = "http://schema.org/";

    public static final ValueFactory valueFactory = SimpleValueFactory.getInstance();

    public static final IRI NAMESPACE_IRI = valueFactory.createIRI("http://schema.org/");
    public static final Namespace NS = new SimpleNamespace(PREFIX, NAMESPACE);

    public final IRI getNamespaceIri() {
        return NAMESPACE_IRI;
    }

    private static String FULL_IRI(final String localName) {
        return NAMESPACE + localName;
    }

    // *****************
    // All the Classes.
    // *****************

    /**
     * A person (alive, dead, undead, or fictional).
     */
    public static final IRI Person = valueFactory.createIRI(FULL_IRI("Person"));

    // *******************
    // All the Properties.
    // *******************

    /**
     * Given name. In the U.S., the first name of a Person. This can be used along with familyName instead of the name property.
     */
    public static final IRI givenName = valueFactory.createIRI(FULL_IRI("givenName"));

    /**
     * Family name. In the U.S., the last name of an Person. This can be used along with givenName instead of the name property.
     */
    public static final IRI familyName = valueFactory.createIRI(FULL_IRI("familyName"));

    /**
     * Additional Name
     */
    public static final IRI additionalName = valueFactory.createIRI(FULL_IRI("additionalName"));

    /**
     * Must have comment too!
     */
    public static final IRI newTerm = valueFactory.createIRI(FULL_IRI("newTerm"));


    // **************************
    // All the constant strings.
    // **************************

    /**
     * Just a test constant string.
     */
    public static final String testConstantString = "String constant string value - just for illustration...";

    // ***********************
    // All the constant IRIs.
    // ***********************

    /**
     * Just a test constant IRI.
     */
    public static final IRI testConstantIri = SimpleValueFactory.getInstance().createIRI("https://test-iri.com/just-for-illustration#test");
}
